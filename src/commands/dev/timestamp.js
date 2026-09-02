/**
 * MeliodasBot — Comando .timestamp
 * Converte timestamps UNIX e datas para múltiplos formatos
 */

const { convertTimestamp } = require('../../services/devService')

module.exports = {
    name: 'timestamp',
    aliases: ['time', 'epoch', 'ts'],
    category: 'dev',
    description: 'Converte timestamp UNIX e datas (ISO, UTC, BRT)',
    cooldownMs: 2000,
    execute: async ({ text, reply }) => {
        try {
            const res = convertTimestamp(text)

            let msg = `🕒 *CONVERSOR DE TIMESTAMP*\n\n`
            msg += `📌 *UNIX (Segundos):* \`${res.unixSeconds}\`\n`
            msg += `📌 *UNIX (Milissegundos):* \`${res.unixMillis}\`\n`
            msg += `🇧🇷 *Horário de Brasília (BRT):* ${res.brt}\n`
            msg += `🌐 *ISO 8601:* \`${res.iso}\`\n`
            msg += `⏱️ *UTC:* ${res.utc}`

            await reply(msg)
        } catch (err) {
            await reply(`❌ ${err.message}\n\n📌 *Exemplos:*\n• \`.timestamp\` (Gera atual)\n• \`.timestamp 1700000000\`\n• \`.timestamp 2026-08-30T18:00:00Z\``)
        }
    }
}

