/**
 * Comando .health
 * Diagnóstico de integridade e saúde operacional (SQLite, RAM, Heap, Uptime)
 */

const { getHealthReport } = require('../../services/telemetryService')

module.exports = {
    name: 'health',
    aliases: ['saude', 'statusbot', 'healthcheck'],
    category: 'general',
    description: 'Exibe status de saúde do bot, integridade do SQLite e memória RAM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const report = getHealthReport()

        const statusIcon = report.status === 'HEALTHY' ? '🟢' : '🔴'

        let msg = `${statusIcon} *HEALTHCHECK & INTEGRIDADE DO BOT*\n\n`
        msg += `📌 *Status Geral:* \`${report.status}\`\n`
        msg += `💾 *SQLite Database:* \`${report.sqlite.status}\` (${report.sqlite.sizeKb} KB)\n`
        msg += `🧠 *Memória RSS:* ${report.memory.rssMb} MB / 512 MB (VPS)\n`
        msg += `📦 *Heap Utilizado:* ${report.memory.heapUsedMb} MB / ${report.memory.heapTotalMb} MB\n`
        msg += `⏱️ *Uptime do Processo:* ${report.system.uptime}\n`
        msg += `⚡ *Plataforma:* ${report.system.platform} (Node ${report.system.nodeVersion})\n`
        msg += `📊 *Load Average:* ${report.system.loadAvg}`

        await reply(msg)
    }
}

