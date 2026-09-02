/**
 * MeliodasBot — Bot Lifecycle Scheduler Service
 *
 * Gerencia agendamentos de abertura, fechamento e estado operacional do bot
 * com persistência total em SQLite e recuperação após restarts (PM2 / Docker / VPS).
 */

const scheduleRepo = require('../database/repositories/scheduleRepository')
const logger = require('../core/logger')

const BOT_STATES = {
    ONLINE: 'ONLINE',
    SCHEDULED_CLOSE: 'SCHEDULED_CLOSE',
    CLOSING: 'CLOSING',
    OFFLINE: 'OFFLINE',
    SCHEDULED_OPEN: 'SCHEDULED_OPEN',
    STARTING: 'STARTING',
    MAINTENANCE: 'MAINTENANCE'
}

let activeCloseTimer = null
let activeOpenTimer = null
const timezone = process.env.BOT_TIMEZONE || 'America/Sao_Paulo'

/**
 * Converte string de duração (30s, 10m, 2h, 1d) em milissegundos
 */
function parseDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') {
        throw new Error('Duração inválida. Formato esperado: 30s, 10m, 2h, 1d.')
    }

    const match = durationStr.trim().match(/^(\d+)([smhd])$/i)
    if (!match) {
        throw new Error('Unidade de duração inválida. Use s (segundos), m (minutos), h (horas) ou d (dias). Ex: 30m, 2h.')
    }

    const value = parseInt(match[1], 10)
    const unit = match[2].toLowerCase()

    if (value <= 0 || isNaN(value)) {
        throw new Error('O valor da duração deve ser um número inteiro positivo maior que zero.')
    }

    if (unit === 'd' && value > 365) {
        throw new Error('Duração máxima permitida é de 365 dias.')
    }

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    }

    return value * multipliers[unit]
}

/**
 * Converte horário no formato HH:MM (ex: 23:00, 07:30) para timestamp no fuso configurado
 */
function parseTimeToTimestamp(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        throw new Error('Horário inválido. Formato esperado: HH:MM (ex: 23:00, 07:30).')
    }

    const match = timeStr.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
    if (!match) {
        throw new Error('Horário inválido. Horas devem estar entre 00 e 23, e minutos entre 00 e 59.')
    }

    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)

    const now = new Date()
    const target = new Date(now)
    target.setHours(hours, minutes, 0, 0)

    // Se o horário já passou hoje, agenda para o dia seguinte
    if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1)
    }

    return target.getTime()
}

/**
 * Retorna o estado operacional atual do bot
 */
function getBotState() {
    return scheduleRepo.getOperationalState()
}

/**
 * Define o estado operacional do bot
 */
function setBotState(state) {
    scheduleRepo.setOperationalState(state)
}

/**
 * Inicializa e restaura agendamentos pendentes do SQLite após boot ou restart
 */
function initScheduler() {
    clearActiveTimers()

    const state = scheduleRepo.getOperationalState()
    const activeSchedules = scheduleRepo.getActiveSchedules()

    logger.info(`[BOOT] Inicializando Bot Scheduler. Estado operacional no banco: ${state} (${activeSchedules.length} agendamentos ativos)`)

    if (activeSchedules.length === 0) {
        if (state !== BOT_STATES.ONLINE && state !== BOT_STATES.OFFLINE && state !== BOT_STATES.MAINTENANCE) {
            setBotState(BOT_STATES.ONLINE)
        }
        return
    }

    const currentSchedule = activeSchedules[0]
    const now = Date.now()

    // 1. Fechamento por duração ou horário com reabertura pendente
    if (currentSchedule.reopen_at) {
        if (now < currentSchedule.execute_at) {
            // Ainda não chegou a hora de fechar
            setBotState(BOT_STATES.SCHEDULED_CLOSE)
            armCloseTimer(currentSchedule)
            logger.info(`[SCHEDULE_RESTORED] Fechamento agendado restaurado para ${new Date(currentSchedule.execute_at).toLocaleString()}`)
        } else if (now >= currentSchedule.execute_at && now < currentSchedule.reopen_at) {
            // Está dentro do período em que o bot deve permanecer OFFLINE
            setBotState(BOT_STATES.OFFLINE)
            armReopenTimer(currentSchedule)
            logger.info(`[SCHEDULE_RESTORED] Estado OFFLINE restaurado. Reabertura programada para ${new Date(currentSchedule.reopen_at).toLocaleString()}`)
        } else {
            // O período já expirou
            scheduleRepo.updateScheduleStatus(currentSchedule.id, 'COMPLETED')
            setBotState(BOT_STATES.ONLINE)
            logger.info(`[SCHEDULE_RESTORED] Agendamento ${currentSchedule.id} expirado durante restart. Bot restaurado para ONLINE.`)
        }
    } else if (currentSchedule.execute_at) {
        if (now < currentSchedule.execute_at) {
            setBotState(BOT_STATES.SCHEDULED_CLOSE)
            armCloseTimer(currentSchedule)
        } else {
            setBotState(BOT_STATES.OFFLINE)
            logger.info(`[SCHEDULE_RESTORED] Bot em modo OFFLINE INDEFINIDO após restart.`)
        }
    }
}

/**
 * Agenda fechamento temporário por duração (ex: .botclose 30m, 2h)
 */
function scheduleCloseDuration(durationStr, createdBy = 'OWNER') {
    const durationMs = parseDuration(durationStr)
    const now = Date.now()
    const executeAt = now
    const reopenAt = now + durationMs

    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()

    const id = `sched_${now}`
    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt,
        reopenAt,
        mode: 'DURATION',
        status: 'EXECUTING',
        createdBy
    })

    setBotState(BOT_STATES.OFFLINE)
    armReopenTimer({ id, reopen_at: reopenAt })

    logger.info(`[BOT_CLOSE_STARTED] Bot fechado temporariamente por ${durationStr} por ${createdBy}. Reabertura em: ${new Date(reopenAt).toLocaleTimeString()}`)

    return {
        id,
        durationStr,
        reopenAt,
        reopenAtFormatted: new Date(reopenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
}

/**
 * Agenda fechamento e reabertura em horários específicos (ex: .botclose 23:00 07:00)
 */
function scheduleCloseAtTime(closeTimeStr, reopenTimeStr = null, createdBy = 'OWNER') {
    const closeTimestamp = parseTimeToTimestamp(closeTimeStr)
    let reopenTimestamp = null

    if (reopenTimeStr) {
        reopenTimestamp = parseTimeToTimestamp(reopenTimeStr)
        // Se a reabertura for antes do fechamento, é para o dia seguinte do fechamento
        if (reopenTimestamp <= closeTimestamp) {
            const d = new Date(reopenTimestamp)
            d.setDate(d.getDate() + 1)
            reopenTimestamp = d.getTime()
        }
    }

    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()

    const now = Date.now()
    const id = `sched_${now}`
    const mode = reopenTimeStr ? 'CYCLE' : 'TIME'

    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt: closeTimestamp,
        reopenAt: reopenTimestamp,
        mode,
        status: 'PENDING',
        createdBy
    })

    setBotState(BOT_STATES.SCHEDULED_CLOSE)
    armCloseTimer({ id, execute_at: closeTimestamp, reopen_at: reopenTimestamp })

    logger.info(`[SCHEDULE_CREATED] Fechamento agendado para ${new Date(closeTimestamp).toLocaleTimeString()}${reopenTimestamp ? `, reabertura às ${new Date(reopenTimestamp).toLocaleTimeString()}` : ''}`)

    return {
        id,
        closeTimestamp,
        reopenTimestamp,
        closeFormatted: new Date(closeTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reopenFormatted: reopenTimestamp ? new Date(reopenTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Indefinido'
    }
}

/**
 * Fecha o bot indefinidamente (ex: .botclose indefinite)
 */
function scheduleCloseIndefinite(createdBy = 'OWNER') {
    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()

    const now = Date.now()
    const id = `sched_${now}`

    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt: now,
        reopenAt: null,
        mode: 'INDEFINITE',
        status: 'EXECUTING',
        createdBy
    })

    setBotState(BOT_STATES.OFFLINE)
    logger.info(`[BOT_CLOSE_STARTED] Bot fechado indefinidamente por ${createdBy}`)

    return { id }
}

/**
 * Reabre o bot imediatamente
 */
function openImmediately(createdBy = 'OWNER') {
    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()
    setBotState(BOT_STATES.ONLINE)
    logger.info(`[BOT_OPEN_COMPLETED] Bot reaberto imediatamente por ${createdBy}`)
}

/**
 * Cancela qualquer agendamento pendente
 */
function cancelActiveSchedule() {
    clearActiveTimers()
    const changes = scheduleRepo.cancelPendingSchedules()
    setBotState(BOT_STATES.ONLINE)
    return changes > 0
}

/**
 * Arma o timer para o fechamento programado
 */
function armCloseTimer(schedule) {
    const delay = schedule.execute_at - Date.now()
    if (delay <= 0) {
        executeClose(schedule)
        return
    }

    clearTimeout(activeCloseTimer)
    activeCloseTimer = setTimeout(() => {
        executeClose(schedule)
    }, delay)
}

/**
 * Executa a transição para OFFLINE quando chega o horário de fechamento
 */
function executeClose(schedule) {
    logger.info(`[BOT_CLOSE_COMPLETED] Executando fechamento programado (${schedule.id})`)
    setBotState(BOT_STATES.OFFLINE)
    scheduleRepo.updateScheduleStatus(schedule.id, 'EXECUTING')

    if (schedule.reopen_at) {
        armReopenTimer(schedule)
    }
}

/**
 * Arma o timer para a reabertura programada
 */
function armReopenTimer(schedule) {
    const delay = schedule.reopen_at - Date.now()
    if (delay <= 0) {
        executeReopen(schedule)
        return
    }

    clearTimeout(activeOpenTimer)
    activeOpenTimer = setTimeout(() => {
        executeReopen(schedule)
    }, delay)
}

/**
 * Executa a reabertura programada
 */
function executeReopen(schedule) {
    logger.info(`[BOT_OPEN_COMPLETED] Executando reabertura programada (${schedule.id})`)
    setBotState(BOT_STATES.ONLINE)
    scheduleRepo.updateScheduleStatus(schedule.id, 'COMPLETED')
}

function clearActiveTimers() {
    if (activeCloseTimer) clearTimeout(activeCloseTimer)
    if (activeOpenTimer) clearTimeout(activeOpenTimer)
    activeCloseTimer = null
    activeOpenTimer = null
}

/**
 * Formata o card visual de status do Scheduler
 */
function getScheduleStatusCard() {
    const state = getBotState()
    const active = scheduleRepo.getActiveSchedules()

    let statusEmoji = '🟢 ONLINE'
    if (state === BOT_STATES.OFFLINE) statusEmoji = '🔴 OFFLINE'
    else if (state === BOT_STATES.SCHEDULED_CLOSE) statusEmoji = '🟡 AGENDADO PARA FECHAR'
    else if (state === BOT_STATES.SCHEDULED_OPEN) statusEmoji = '🟡 AGENDADO PARA ABRIR'
    else if (state === BOT_STATES.MAINTENANCE) statusEmoji = '🔧 MODO MANUTENÇÃO'

    if (active.length === 0) {
        return `🤖 *BOT SCHEDULER*\n\n📊 *Status:* ${statusEmoji}\n⚙️ *Modo:* MANUAL\n\n_Nenhum agendamento ativo no momento._`
    }

    const sched = active[0]
    const now = Date.now()

    let proximaAcao = sched.status === 'EXECUTING' && sched.reopen_at ? '🟢 ABRIR' : '🔴 FECHAR'
    let proximoHorario = sched.status === 'EXECUTING' && sched.reopen_at ? sched.reopen_at : sched.execute_at
    let tempoRestanteMs = Math.max(0, proximoHorario - now)

    const horas = Math.floor(tempoRestanteMs / 3600000)
    const minutos = Math.floor((tempoRestanteMs % 3600000) / 60000)
    const tempoStr = `${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}min`

    const horarioStr = new Date(sched.execute_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const reaberturaStr = sched.reopen_at ? new Date(sched.reopen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Indefinido'

    return `🤖 *BOT SCHEDULER*

📊 *Status:* ${statusEmoji}
⚙️ *Modo:* ${sched.mode}

🎯 *Próxima ação:*
${proximaAcao}

🕒 *Horário:*
${horarioStr}

🔄 *Reabertura:*
${reaberturaStr}

⏳ *Tempo restante:*
${tempoStr}`
}

module.exports = {
    BOT_STATES,
    parseDuration,
    parseTimeToTimestamp,
    getBotState,
    setBotState,
    initScheduler,
    scheduleCloseDuration,
    scheduleCloseAtTime,
    scheduleCloseIndefinite,
    openImmediately,
    cancelActiveSchedule,
    getScheduleStatusCard,
    timezone
}
