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

/**
 * Verifica se o Modo Aluguel está ativo globalmente ou no grupo
 */
function isRentalModeEnabled(groupJid = null) {
    const configs = dataService.getConfigsData()
    if (groupJid && configs[groupJid]?.rentalMode !== undefined) {
        return Boolean(configs[groupJid].rentalMode)
    }
    return Boolean(configs.rentalModeEnabled || configs.global?.rentalMode)
}

/**
 * Ativa ou desativa o Modo Aluguel
 */
async function setRentalMode(enabled, groupJid = null) {
    const configs = dataService.getConfigsData()
    if (groupJid) {
        if (!configs[groupJid]) configs[groupJid] = {}
        configs[groupJid].rentalMode = Boolean(enabled)
    } else {
        configs.rentalModeEnabled = Boolean(enabled)
        if (!configs.global) configs.global = {}
        configs.global.rentalMode = Boolean(enabled)
    }
    await dataService.saveConfigsData(configs)
    logger.info(`[RENTAL MODE] Modo Aluguel alterado para: ${enabled ? 'ATIVO' : 'DESATIVADO'} (Escopo: ${groupJid || 'GLOBAL'})`)
    return enabled
}

/**
 * Registra ou substitui o aluguel de um grupo
 */
function setRental({ groupJid, groupName = '', renterJid = '', rentedBy = '', durationStr = '30d', price = 0, pixKey = '', notes = '' }) {
    const durationMs = parseRentalDuration(durationStr)
    if (!durationMs) {
        throw new Error(`Formato de duração inválido: "${durationStr}". Use: 30d, 7d, 24h, 15m, 60d.`)
    }

    const now = Date.now()
    const expiresAt = now + durationMs

    const rentalObj = {
        groupJid,
        groupName,
        renterJid,
        rentedBy,
        startsAt: now,
        expiresAt,
        isActive: true,
        price: Number(price) || 0,
        paymentMethod: 'Pix',
        pixKey: pixKey || '',
        notes: notes || ''
    }

    const saved = rentalRepo.saveRental(rentalObj)
    if (saved) {
        logger.info(`[RENTAL SET] Grupo ${groupJid} (${groupName}) alugado por ${durationStr} por ${rentedBy}`)
    }
    return rentalObj
}

/**
 * Adiciona tempo extra a um aluguel existente
 */
function addRentalTime(groupJid, durationStr, rentedBy = '') {
    const durationMs = parseRentalDuration(durationStr)
    if (!durationMs) {
        throw new Error(`Formato de duração inválido: "${durationStr}". Use: 30d, 7d, 24h, 15m, 60d.`)
    }

    const current = rentalRepo.getRental(groupJid)
    const now = Date.now()
    const baseTime = (current && current.expiresAt > now) ? current.expiresAt : now
    const newExpiresAt = baseTime + durationMs

    const rentalObj = {
        groupJid,
        groupName: current?.groupName || '',
        renterJid: current?.renterJid || '',
        rentedBy: rentedBy || current?.rentedBy || '',
        startsAt: current?.startsAt || now,
        expiresAt: newExpiresAt,
        isActive: true,
        price: current?.price || 0,
        paymentMethod: current?.paymentMethod || 'Pix',
        pixKey: current?.pixKey || '',
        notes: current?.notes || ''
    }

    rentalRepo.saveRental(rentalObj)
    logger.info(`[RENTAL EXTEND] Aluguel do grupo ${groupJid} estendido por +${durationStr}`)
    return rentalObj
}

/**
 * Remove / cancela o aluguel de um grupo
 */
function removeRental(groupJid) {
    return rentalRepo.deleteRental(groupJid)
}

/**
 * Consulta informações completas de aluguel de um grupo
 */
function getRentalInfo(groupJid) {
    const r = rentalRepo.getRental(groupJid)
    if (!r) return null

    const now = Date.now()
    const isExpired = now > r.expiresAt
    const remainingMs = Math.max(0, r.expiresAt - now)
    const remainingText = formatTimeRemaining(remainingMs)

    return {
        ...r,
        isExpired,
        remainingMs,
        remainingText,
        startsAtFormatted: new Date(r.startsAt).toLocaleString('pt-BR'),
        expiresAtFormatted: new Date(r.expiresAt).toLocaleString('pt-BR')
    }
}

/**
 * Retorna todos os aluguéis registrados
 */
function getAllRentalsList() {
    const list = rentalRepo.getAllRentals()
    const now = Date.now()

    return list.map(r => {
        const isExpired = now > r.expiresAt
        const remainingMs = Math.max(0, r.expiresAt - now)
        return {
            ...r,
            isExpired,
            remainingMs,
            remainingText: formatTimeRemaining(remainingMs),
            startsAtFormatted: new Date(r.startsAt).toLocaleString('pt-BR'),
            expiresAtFormatted: new Date(r.expiresAt).toLocaleString('pt-BR')
        }
    })
}

module.exports = {
    parseRentalDuration,
    formatTimeRemaining,
    isRentalModeEnabled,
    setRentalMode,
    setRental,
    addRentalTime,
    removeRental,
    getRentalInfo,
    getAllRentalsList
}

