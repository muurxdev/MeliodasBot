/**
 * Comando .queue
 * Exibe o status da fila de downloads, concorrência e jobs em andamento
 */

const { mediaQueue } = require('../../services/mediaQueue')

module.exports = {
    name: 'queue',
    aliases: ['fila', 'jobs', 'downloads'],
    category: 'media',
    description: 'Exibe o status da fila de downloads e processamento de mídia',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const stats = mediaQueue.getStats()

        let msg = `╭━━━〔 🚦 *FILA DE DOWNLOADS* 〕━━━┈⊷\n`
        msg += `┃ ⚡ *Workers Ativos:* ${stats.activeWorkers} / ${stats.maxConcurrency}\n`
        msg += `┃ 📋 *Na Fila de Espera:* ${stats.queueLength}\n`
        msg += `┣━━━━━━━━━━━━━━━━━━━━━━━━━\n`

        if (stats.activeJobs.length === 0 && stats.pendingJobs.length === 0) {
            msg += `┃ 🟢 *Nenhum download em andamento.* Servidor ocioso!\n`
        } else {
            if (stats.activeJobs.length > 0) {
                msg += `┃ 📥 *EM EXECUÇÃO:*\n`
                stats.activeJobs.forEach((j, i) => {
                    const elapsed = (j.runningForMs / 1000).toFixed(0)
                    msg += `┃  ${i + 1}. \`${j.id}\` (Prio ${j.priority}) | ⏱️ ${elapsed}s\n`
                })
            }

            if (stats.pendingJobs.length > 0) {
                msg += `┃\n┃ ⏳ *AGUARDANDO NA FILA:*\n`
                stats.pendingJobs.forEach((j, i) => {
                    const queued = (j.queuedForMs / 1000).toFixed(0)
                    msg += `┃  #${i + 1} \`${j.id}\` [${j.format.toUpperCase()}] | ⌛ ${queued}s\n`
                })
            }
        }

        msg += `╰━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n`
        msg += `_Para cancelar seu download:_ \`.cancel <jobId>\``

        await reply(msg.trim())
    }
}

