const dataService = require('./dataService')
const rentalRepo = require('../database/repositories/rentalRepository')
const logger = require('../core/logger')

const INFINITE_KEYWORDS = ['inf', 'infinito', 'vitalicio', 'vitalício', 'permanente', 'ilimitado', 'sempre', '0']
const INFINITE_DURATION_MS = 300 * 365 * 24 * 60 * 60 * 1000 // ~300 anos

/**
 * Converte strings de duração (ex: '30d', '7d', '24h', '30m', '1y', 'inf') em milissegundos
 */
function parseRentalDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return null
    const clean = durationStr.trim().toLowerCase()

    if (INFINITE_KEYWORDS.includes(clean)) {
        return INFINITE_DURATION_MS
    }

    // Formato com dígitos e unidade (ex: 30d, 7d, 24h, 15m, 1y)
    const match = clean.match(/^(\d+)\s*(s|m|h|d|sem|mes|ano|y)?$/)
    if (!match) return null

    const value = parseInt(match[1], 10)
    const unit = match[2] || 'd' // Default dias

    switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        case 'd': return value * 24 * 60 * 60 * 1000
        case 'sem': return value * 7 * 24 * 60 * 60 * 1000
        case 'mes': return value * 30 * 24 * 60 * 60 * 1000
        case 'ano':
        case 'y': return value * 365 * 24 * 60 * 60 * 1000
        default: return value * 24 * 60 * 60 * 1000
    }
}

/**
 * Formata milissegundos restantes em tempo legível
 */
function formatTimeRemaining(diffMs, isLifetime = false) {
    if (isLifetime || diffMs >= 50 * 365 * 24 * 60 * 60 * 1000) {
        return '♾️ TEMPO INFINITO (VITALÍCIO)'
    }

    if (diffMs <= 0) return '🔴 EXPIRADO'

    const segundosTotal = Math.floor(diffMs / 1000)
    const dias = Math.floor(segundosTotal / 86400)
    const horas = Math.floor((segundosTotal % 86400) / 3600)
    const minutos = Math.floor((segundosTotal % 3600) / 60)

    const partes = []
    if (dias > 0) partes.push(`${dias} dia${dias > 1 ? 's' : ''}`)
    if (horas > 0) partes.push(`${horas} hora${horas > 1 ? 's' : ''}`)
    if (minutos > 0 && dias === 0) partes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`)

    return partes.length > 0 ? partes.join(' e ') : 'Menos de 1 minuto'
}

const TARGET_TYPES = {
    GROUP: 'group',
    PV: 'pv',
    COMBO: 'combo'
}

/**
 * Verifica se o Modo Aluguel está ativo globalmente, no grupo ou no PV
 * @param {string|null} scopeJid - JID do grupo ou do usuário
 * @param {boolean} isGroup - true se for mensagem de grupo, false se for privado
 */
function isRentalModeEnabled(scopeJid = null, isGroup = true) {
    const configs = dataService.getConfigsData()
    if (isGroup && scopeJid && configs[scopeJid]?.rentalMode !== undefined) {
        return Boolean(configs[scopeJid].rentalMode)
    }
    if (!isGroup) {
        if (configs.global?.rentalModePv !== undefined) return Boolean(configs.global.rentalModePv)
        if (configs.rentalModePv !== undefined) {
            return typeof configs.rentalModePv === 'object' ? Boolean(configs.rentalModePv.enabled) : Boolean(configs.rentalModePv)
        }
    }
    if (configs.global?.rentalMode !== undefined) {
        return Boolean(configs.global.rentalMode)
    }
    if (configs.rentalModeEnabled !== undefined) {
        return typeof configs.rentalModeEnabled === 'object' ? Boolean(configs.rentalModeEnabled.enabled) : Boolean(configs.rentalModeEnabled)
    }
    return true
}

/**
 * Ativa ou desativa o Modo Aluguel
 * @param {boolean} enabled
 * @param {'global'|'grupo'|'pv'|string|null} scope
 */
async function setRentalMode(enabled, scope = null) {
    const configs = dataService.getConfigsData()
    const isBool = Boolean(enabled)

    if (!configs.global) configs.global = {}

    if (scope === 'pv' || scope === 'dm') {
        configs.global.rentalModePv = isBool
        configs.rentalModePv = { enabled: isBool }
    } else if (scope && scope.endsWith('@g.us')) {
        if (!configs[scope]) configs[scope] = {}
        configs[scope].rentalMode = isBool
    } else {
        configs.global.rentalMode = isBool
        configs.rentalModeEnabled = { enabled: isBool }
        if (isBool && configs.global.rentalModePv === undefined) {
            configs.global.rentalModePv = true
        }
    }

    await dataService.saveConfigsData(configs)
    logger.info(`[RENTAL MODE] Modo Aluguel alterado para: ${isBool ? 'ATIVO' : 'DESATIVADO'} (Escopo: ${scope || 'GLOBAL'})`)
    return isBool
}

/**
 * Resolve de forma inteligente o alvo de aluguel:
 * - Número com ou sem DDI (+55 11 99999-9999, 5511999999999, 11999999999)
 * - Menções (@5511...)
 * - JIDs diretos (@s.whatsapp.net, @lid, @g.us)
 * - Busca por Nick ou Nome cadastrado no banco de dados SQLite
 */
async function resolveRentalTarget(input, context = {}) {
    const raw = (input || '').trim()
    const { from, isGroup = false, client = null } = context

    if (!raw) {
        if (isGroup && from) {
            let name = 'Grupo Atual'
            try {
                if (client) {
                    const m = await client.groupMetadata(from)
                    if (m?.subject) name = m.subject
                }
            } catch (_) {}
            return { jid: from, name, type: 'group' }
        }
        return null
    }

    if (raw.endsWith('@g.us')) {
        let name = 'Grupo de WhatsApp'
        try {
            if (client) {
                const m = await client.groupMetadata(raw)
                if (m?.subject) name = m.subject
            }
        } catch (_) {}
        return { jid: raw, name, type: 'group' }
    }

    if (raw.endsWith('@s.whatsapp.net') || raw.endsWith('@lid')) {
        let name = raw.split('@')[0]
        try {
            const userRepo = require('../database/repositories/userRepository')
            const u = userRepo.getUser(raw)
            if (u?.display_nick || u?.name) name = u.display_nick || u.name
        } catch (_) {}
        return { jid: raw, name, type: 'pv' }
    }

    const digitsOnly = raw.replace(/\D/g, '')
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
        let phone = digitsOnly
        if ((digitsOnly.length === 10 || digitsOnly.length === 11) && !digitsOnly.startsWith('55')) {
            phone = '55' + digitsOnly
        }
        const userJid = `${phone}@s.whatsapp.net`
        let name = `+${phone}`
        try {
            const userRepo = require('../database/repositories/userRepository')
            const u = userRepo.getUser(userJid)
            if (u?.display_nick || u?.name) name = u.display_nick || u.name
        } catch (_) {}
        return { jid: userJid, name, type: 'pv' }
    }

    try {
        const { getDatabase } = require('../database/connection')
        const db = getDatabase()
        const term = raw.toLowerCase()

        let row = db.prepare(`
            SELECT jid, name, display_nick FROM users 
            WHERE lower(display_nick) = ? OR lower(name) = ?
            ORDER BY level DESC, xp DESC LIMIT 1
        `).get(term, term)

        if (!row) {
            row = db.prepare(`
                SELECT jid, name, display_nick FROM users 
                WHERE lower(display_nick) LIKE ? OR lower(name) LIKE ?
                ORDER BY level DESC, xp DESC LIMIT 1
            `).get(`%${term}%`, `%${term}%`)
        }

        if (row && row.jid) {
            return {
                jid: row.jid,
                name: row.display_nick || row.name || row.jid.split('@')[0],
                type: row.jid.endsWith('@g.us') ? 'group' : 'pv'
            }
        }
    } catch (dbErr) {
        logger.warn('[RENTAL TARGET RESOLVE WARN]', dbErr.message)
    }

    return null
}

/**
 * Consulta se um alvo possui aluguel ativo (grupo ou PV)
 */
function hasActiveRental(targetJid, scope = 'group', candidateJids = []) {
    if (!targetJid) return { active: false, reason: 'no_target', rental: null }

    let allCandidates = [targetJid, ...(Array.isArray(candidateJids) ? candidateJids : [candidateJids])].filter(Boolean)
    if (scope === 'pv' || !targetJid.endsWith('@g.us')) {
        try {
            const userRepo = require('../database/repositories/userRepository')
            allCandidates = userRepo.resolveLinkedJids(allCandidates)
        } catch (_) {}
    }

    const rental = rentalRepo.getRental(targetJid, allCandidates)
    if (!rental || !rental.isActive) {
        return { active: false, reason: 'not_found', rental: null }
    }

    const now = Date.now()
    const isLifetime = Boolean(rental.isLifetime) || (rental.expiresAt - now >= 50 * 365 * 86400 * 1000)
    if (!isLifetime && now > rental.expiresAt) {
        return { active: false, reason: 'expired', rental }
    }

    return {
        active: true,
        isLifetime,
        isTrial: Boolean(rental.isTrial),
        targetType: rental.targetType,
        remainingMs: isLifetime ? Infinity : Math.max(0, rental.expiresAt - now),
        rental
    }
}

/**
 * Registra ou substitui o aluguel
 */
function setRental({
    groupJid = '',
    targetJid = '',
    targetType = null,
    targetName = '',
    groupName = '',
    renterJid = '',
    rentedBy = '',
    durationStr = '30d',
    price = 0,
    pixKey = '',
    notes = '',
    isTrial = false,
    isLifetime = false
}) {
    const finalJid = targetJid || groupJid
    if (!finalJid) throw new Error('JID de destino não especificado.')

    const finalType = targetType || (finalJid.endsWith('@g.us') ? TARGET_TYPES.GROUP : TARGET_TYPES.PV)
    const finalName = targetName || groupName || ''

    const isInf = isLifetime || INFINITE_KEYWORDS.includes(String(durationStr).trim().toLowerCase())
    const durationMs = isInf ? INFINITE_DURATION_MS : parseRentalDuration(durationStr)

    if (!durationMs) {
        throw new Error(`Formato de duração inválido: "${durationStr}". Use: 30d, 7d, 24h, 15m, 60d, vitalicio.`)
    }

    const now = Date.now()
    const expiresAt = now + durationMs

    const rentalObj = {
        groupJid: finalJid,
        targetJid: finalJid,
        targetType: finalType,
        targetName: finalName,
        groupName: finalName,
        renterJid,
        rentedBy,
        startsAt: now,
        expiresAt,
        isActive: true,
        isTrial: Boolean(isTrial),
        isLifetime: Boolean(isInf),
        price: Number(price) || 0,
        paymentMethod: isInf ? 'Vitalício' : (isTrial ? 'Trial' : 'Pix'),
        pixKey: pixKey || '',
        notes: notes || ''
    }

    const saved = rentalRepo.saveRental(rentalObj)
    if (saved) {
        logger.info(`[RENTAL SET] Alvo ${finalJid} (${finalName}) [${finalType}] alugado por ${isInf ? 'VITALÍCIO' : durationStr} por ${rentedBy}`)
    }
    return rentalObj
}

/**
 * Concede aluguel vitalício (tempo infinito) para grupo, PV ou combo
 */
function setLifetimeRental({
    targetJid,
    targetType = null,
    targetName = '',
    grantedBy = '',
    price = 0,
    pixKey = '',
    notes = ''
}) {
    return setRental({
        targetJid,
        targetType,
        targetName,
        rentedBy: grantedBy,
        durationStr: 'vitalicio',
        isLifetime: true,
        price,
        pixKey,
        notes: notes || 'Acesso vitalício concedido por Dono'
    })
}

/**
 * Ativa período de teste gratuito (Trial) com proteção anti-abuso estrita
 */
function activateTrial({
    targetJid,
    targetType = null,
    targetName = '',
    durationStr = '2h',
    requestedBy = ''
}) {
    if (!targetJid) throw new Error('Alvo inválido para ativação de teste.')

    const finalType = targetType || (targetJid.endsWith('@g.us') ? TARGET_TYPES.GROUP : TARGET_TYPES.PV)

    let candidates = [targetJid]
    if (finalType === TARGET_TYPES.PV || !targetJid.endsWith('@g.us')) {
        try {
            const userRepo = require('../database/repositories/userRepository')
            candidates = userRepo.resolveLinkedJids(candidates)
        } catch (_) {}
    }

    if (rentalRepo.hasUsedTrial(targetJid, candidates)) {
        throw new Error('❌ Este alvo já utilizou o período de teste gratuito anteriormente.')
    }

    const rentalObj = setRental({
        targetJid,
        targetType: finalType,
        targetName,
        renterJid: requestedBy || targetJid,
        rentedBy: requestedBy || 'Sistema (Teste Gratuito)',
        durationStr,
        isTrial: true,
        price: 0,
        notes: `Teste gratuito (${durationStr})`
    })

    rentalRepo.markTrialUsed(targetJid, finalType)
    logger.info(`[RENTAL TRIAL] Teste gratuito ativado para ${targetJid} (${finalType})`)
    return rentalObj
}

/**
 * Adiciona tempo extra a um aluguel existente
 */
function addRentalTime(targetJid, durationStr, rentedBy = '', targetType = null) {
    const durationMs = parseRentalDuration(durationStr)
    if (!durationMs) {
        throw new Error(`Formato de duração inválido: "${durationStr}". Use: 30d, 7d, 24h, 15m, 60d.`)
    }

    const current = rentalRepo.getRental(targetJid)
    const now = Date.now()
    const baseTime = (current && current.expiresAt > now) ? current.expiresAt : now
    const newExpiresAt = baseTime + durationMs

    const isInf = INFINITE_KEYWORDS.includes(String(durationStr).trim().toLowerCase()) || (current && current.isLifetime)
    const finalType = targetType || current?.targetType || (targetJid.endsWith('@g.us') ? TARGET_TYPES.GROUP : TARGET_TYPES.PV)

    const rentalObj = {
        groupJid: targetJid,
        targetJid,
        targetType: finalType,
        targetName: current?.targetName || current?.groupName || '',
        groupName: current?.groupName || '',
        renterJid: current?.renterJid || '',
        rentedBy: rentedBy || current?.rentedBy || '',
        startsAt: current?.startsAt || now,
        expiresAt: isInf ? now + INFINITE_DURATION_MS : newExpiresAt,
        isActive: true,
        isTrial: false,
        isLifetime: Boolean(isInf),
        price: current?.price || 0,
        paymentMethod: current?.paymentMethod || 'Pix',
        pixKey: current?.pixKey || '',
        notes: current?.notes || ''
    }

    rentalRepo.saveRental(rentalObj)
    logger.info(`[RENTAL EXTEND] Aluguel de ${targetJid} estendido por +${durationStr}`)
    return rentalObj
}

/**
 * Remove / cancela o aluguel
 */
function removeRental(targetJid) {
    return rentalRepo.deleteRental(targetJid)
}

/**
 * Consulta informações completas de aluguel
 */
function getRentalInfo(targetJid, alternativeJids = []) {
    const r = rentalRepo.getRental(targetJid, alternativeJids)
    if (!r) return null

    const now = Date.now()
    const isLifetime = Boolean(r.isLifetime) || (r.expiresAt - now >= 50 * 365 * 86400 * 1000)
    const isExpired = !isLifetime && now > r.expiresAt
    const remainingMs = isLifetime ? Infinity : Math.max(0, r.expiresAt - now)
    const remainingText = formatTimeRemaining(remainingMs, isLifetime)

    return {
        ...r,
        isLifetime,
        isExpired,
        remainingMs,
        remainingText,
        startsAtFormatted: new Date(r.startsAt).toLocaleString('pt-BR'),
        expiresAtFormatted: isLifetime ? '♾️ Permanente (Vitalício)' : new Date(r.expiresAt).toLocaleString('pt-BR')
    }
}

/**
 * Retorna todos os aluguéis registrados
 */
function getAllRentalsList(targetType = null) {
    const list = rentalRepo.getAllRentals(targetType)
    const now = Date.now()

    return list.map(r => {
        const isLifetime = Boolean(r.isLifetime) || (r.expiresAt - now >= 50 * 365 * 86400 * 1000)
        const isExpired = !isLifetime && now > r.expiresAt
        const remainingMs = isLifetime ? Infinity : Math.max(0, r.expiresAt - now)
        return {
            ...r,
            isLifetime,
            isExpired,
            remainingMs,
            remainingText: formatTimeRemaining(remainingMs, isLifetime),
            startsAtFormatted: new Date(r.startsAt).toLocaleString('pt-BR'),
            expiresAtFormatted: isLifetime ? '♾️ Permanente (Vitalício)' : new Date(r.expiresAt).toLocaleString('pt-BR')
        }
    })
}

module.exports = {
    TARGET_TYPES,
    parseRentalDuration,
    formatTimeRemaining,
    isRentalModeEnabled,
    setRentalMode,
    resolveRentalTarget,
    hasActiveRental,
    setRental,
    setLifetimeRental,
    activateTrial,
    addRentalTime,
    removeRental,
    getRentalInfo,
    getAllRentalsList
}

