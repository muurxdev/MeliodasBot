/**
 * Comando .cancel
 * Cancela um download ou processamento ativo do Media Engine
 */

const { mediaEngine } = require('../../services/media/mediaEngine')
const logger = require('../../core/logger')

module.exports = {
    name: 'cancel',
    aliases: ['cancelar', 'abort', 'abortar'],
    category: 'media',
    description: 'Cancela um download ou processamento de mídia em andamento',
    cooldownMs: 2000,
    execute: async ({ text, reply, sender }) => {
        if (!text) {
            return reply('❌ Informe o ID do Job de download para cancelar.\n\n📌 *Exemplo:* `.cancel job_1788124827371_abc`')
        }

        const jobId = text.trim()
        const cancelled = mediaEngine.cancel(jobId)

        if (cancelled) {
            logger.info(`[MEDIA CANCEL] Job ${jobId} cancelado pelo usuário ${sender}`)
            return reply(`✅ *Download Cancelado:* O processamento do Job \`${jobId}\` foi interrompido e os arquivos temporários foram liberados.`)
        } else {
            return reply(`⚠️ *Job não encontrado ou já finalizado:* Não há download ativo registrado com o ID \`${jobId}\`.`)
        }
    }
}

