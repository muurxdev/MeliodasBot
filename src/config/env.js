try {
    require('dotenv').config()
} catch (_) {}

/**
 * Lista de JIDs de donos do bot (BOT_OWNER_ID + BOT_OWNER_IDS separados por vírgula)
 */
function parseOwnerIds() {
    // Donos vêm exclusivamente das variáveis de ambiente BOT_OWNER_ID / BOT_OWNER_IDS.
    // Defina seu número de WhatsApp no .env para se tornar dono do bot.
    const ids = []
    const primary = (process.env.BOT_OWNER_ID || '').trim()
    if (primary && !ids.includes(primary)) ids.push(primary)
    for (const part of (process.env.BOT_OWNER_IDS || '').split(',')) {
        const p = part.trim()
        if (p && !ids.includes(p)) ids.push(p)
    }
    return ids
}

const botOwnerId = process.env.BOT_OWNER_ID || ''
const botOwnerIds = parseOwnerIds()

/**
 * Verifica se um JID pertence a um dos donos do bot (tolerante a sufixo de dispositivo)
 * @param {string} sender - JID do remetente
 * @returns {boolean}
 */
function isOwnerJid(sender = '') {
    if (!sender || typeof sender !== 'string') return false
    const cleanSender = sender.split(':')[0].split('@')[0]
    for (const ownerId of botOwnerIds) {
        if (!ownerId) continue
        const cleanOwner = ownerId.split('@')[0]
        if (cleanOwner && cleanSender === cleanOwner) return true
    }
    return false
}

/**
 * Formata um JID do WhatsApp para número legível (ex: 5511999998888@s.whatsapp.net → +55 11 99999-8888)
 * @param {string} jid
 * @returns {string}
 */
function formatPhoneFromJid(jid = '') {
    // LIDs (@lid) não são números de telefone: exibe o JID como veio
    if (!jid.includes('@s.whatsapp.net')) return jid || ''
    const digits = (jid.split('@')[0] || '').replace(/\D/g, '')
    if (digits.length >= 13) {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9, 13)}`
    }
    if (digits.length === 12) {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)}-${digits.slice(8, 12)}`
    }
    return jid || ''
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
    prefix: process.env.BOT_PREFIX || '.',
    botOwnerId,
    botOwnerIds,
    isOwnerJid,
    formatPhoneFromJid,
    botName: process.env.BOT_NAME || 'MeliodasBot',
    debug: process.env.DEBUG === 'true' || process.env.LOG_LEVEL === 'debug',
    logLevel: process.env.LOG_LEVEL || 'info',
    defaultCooldownMs: parseInt(process.env.DEFAULT_COOLDOWN_MS) || 2000
}