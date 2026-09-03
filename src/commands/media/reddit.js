/**
 * Comando .reddit
 * Download de vídeos e mídias do Reddit com áudio sincronizado via Media Engine
 */

const { mediaEngine, FORMATS } = require('../../services/media/mediaEngine')
const { mediaQueue } = require('../../services/mediaQueue')
const { uploadMedia } = require('../../services/media/mediaUploader')
const logger = require('../../core/logger')

module.exports = {
    name: 'reddit',
    aliases: ['rd', 'redditdl'],
    category: 'media',
    description: 'Baixa vídeos e postagens do Reddit através do link',
    cooldownMs: 5000,
    execute: async ({ text, from, info, client, reply, sender }) => {
        if (!text || (!text.includes('reddit.com') && !text.includes('redd.it'))) {
            return reply('❌ Informe um link válido do Reddit.\n\n📌 *Exemplo:* `.reddit https://www.reddit.com/r/videos/comments/xxxx/`')
        }

        await reply(`🤖 *Processando mídia do Reddit...* Aguarde.`)

        try {
            const meta = await mediaEngine.resolve(text.trim())

            const downloadResult = await mediaQueue.enqueue({
                url: meta.webpageUrl,
                format: FORMATS.MP4,
                user: sender,
                runFn: async () => {
                    const job = mediaEngine.createJob({
                        userId: sender,
                        chatId: from,
                        source: meta.webpageUrl,
                        requestedFormat: FORMATS.MP4
                    })
                    job.metadata = meta
                    return mediaEngine.processJob(job)
                }
            })

            const job = { metadata: meta }
            await uploadMedia({ client, from, job, downloadResult, info })
            mediaEngine.cleanup(downloadResult.jobId)

            logger.info(`[REDDIT] Vídeo enviado com sucesso para ${sender}`)
        } catch (err) {
            logger.error('[REDDIT ERROR]', err)
            await reply(`❌ *Erro no download do Reddit:* ${err.message}`)
        }
    }
}

