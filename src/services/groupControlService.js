/**
 * Group Control Service
 * Fecha e reabre grupos do WhatsApp (só admins podem falar) com duração
 * opcional ou indefinida.
 *
 * O estado é mantido em memória (Map de groupJid -> { closed, until, timer }).
 *  - .fechargrupo <tempo>: fecha agora e reabre automaticamente após o tempo.
 *  - .fechargrupo (sem tempo): fecha indefinidamente (persistente por natureza:
 *    se o bot reiniciar, o grupo continua fechado; abra com .abrirgrupo).
 *  - .abrirgrupo: reabre imediatamente e cancela agendamentos do grupo.
 */

const logger = require('../core/logger')
const { parseDuration } = require('./botScheduler')

const groupStates = new Map()

const GROUP_SETTINGS = Object.freeze({
    CLOSED: 'announcement',
    OPEN: 'not_announcement'
})

/**
 * Fecha o grupo (modo só-admins falam), opcionalmente reabrindo sozinho.
 * @param {object} client - Socket Baileys
 * @param {string} groupJid - JID do grupo
 * @param {object} [opts]
 * @param {string|null} [opts.durationStr] - ex: '30m', '2h', '1d' ou null (indefinido)
 * @returns {Promise<object>} estado do grupo após a ação
 */
async function closeGroup(client, groupJid, { durationStr = null } = {}) {
    if (!client || typeof client.groupSettingUpdate !== 'function') {
        throw new Error('Cliente Baileys não vinculado ao Group Control Service')
    }
    if (!groupJid) throw new Error('groupJid é obrigatório')

    await client.groupSettingUpdate(groupJid, GROUP_SETTINGS.CLOSED)

    clearGroupState(groupJid)

    const until = durationStr ? Date.now() + parseDuration(durationStr) : null
    const entry = { closed: true, until, timer: null }

    if (until) {
        entry.timer = setTimeout(async () => {
            const current = groupStates.get(groupJid)
            if (current && current.until === until) {
                try {
                    await openGroup(client, groupJid)
                    logger.info(`[GROUP CONTROL] Grupo ${groupJid} reaberto automaticamente (tempo expirado)`)
                } catch (err) {
                    logger.error(`[GROUP CONTROL] Falha ao reabrir ${groupJid}: ${err.message}`)
                }
            }
        }, until - Date.now())
        if (entry.timer.unref) entry.timer.unref()
    }

    groupStates.set(groupJid, entry)
    logger.info(`[GROUP CONTROL] Grupo ${groupJid} fechado (dur=${durationStr || 'indefinido'} | until=${until ? new Date(until).toLocaleString() : '—'})`)
    return entry
}

/**
 * Reabre o grupo (todos podem falar) e cancela agendamento pendente.
 * @param {object} client - Socket Baileys
 * @param {string} groupJid
 * @param {object} [opts]
 * @param {boolean} [opts.silent] - não loga info
 * @returns {Promise<object>} estado do grupo após a ação
 */
async function openGroup(client, groupJid, { silent = false } = {}) {
    if (!client || typeof client.groupSettingUpdate !== 'function') {
        throw new Error('Cliente Baileys não vinculado ao Group Control Service')
    }
    if (!groupJid) throw new Error('groupJid é obrigatório')

    await client.groupSettingUpdate(groupJid, GROUP_SETTINGS.OPEN)

    const entry = { closed: false, until: null, timer: null }
    groupStates.set(groupJid, entry)
    if (!silent) logger.info(`[GROUP CONTROL] Grupo ${groupJid} reaberto`)
    return entry
}

/**
 * Estado atual em memória do grupo (sem tocar o WhatsApp)
 * @param {string} groupJid
 * @returns {object}
 */
function getGroupStatus(groupJid) {
    return groupStates.get(groupJid) || { closed: false, until: null }
}

/**
 * Limpa o estado e cancela o timer de reabertura de um grupo
 * @param {string} groupJid
 */
function clearGroupState(groupJid) {
    const prev = groupStates.get(groupJid)
    if (prev && prev.timer) clearTimeout(prev.timer)
    groupStates.delete(groupJid)
}

module.exports = {
    GROUP_SETTINGS,
    closeGroup,
    openGroup,
    getGroupStatus,
    clearGroupState
}