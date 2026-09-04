/**
 * Comando .transcrever
 * Transcreve o áudio/mensagem de voz citado em texto (Whisper local).
 */

const { getBotName } = require('../../config/botConfig')
const { transcribeAudio } = require('../../services/transcriptionService')
const { downloadWhatsAppMedia } = require('../../services/mediaService')
const logger = require('../../core/logger')

module.exports = {
    name: 'transcrever',
    aliases: ['ouvir', 'stt', 'transcricao', 'audiotexto', 'vozpratexto'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Transcreve áudios e mensagens de voz em texto (Whisper)',
    cooldownMs: 4000,
    execute: async ({ reply, client, info, quotedMsg }) => {
        const botName = getBotName()

        // Localiza o áudio: mensagem citada OU a própria mensagem
        const audioNode = quotedMsg?.audioMessage
            || quotedMsg?.videoMessage
            || info?.message?.audioMessage
            || info?.message?.videoMessage
            || (info?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage)

        if (!audioNode) {
            return reply('🎙️ *Transcrição de Áudio*\n\n📌 *Como usar:* responda a um áudio ou mensagem de voz com \`.transcrever\`.\n💡 _Converto a fala em texto automaticamente._')
        }

        await reply('🎙️ *Transcrevendo áudio...* Aguarde um instante.')

        try {
            // Reconstrói o wrapper de mensagem para o download
            const wrapper = quotedMsg
                ? { message: quotedMsg, key: info.key }
                : info
            const buffer = await downloadWhatsAppMedia(wrapper, audioNode === (quotedMsg?.videoMessage || info?.message?.videoMessage) ? 'video' : 'audio', client)
            if (!buffer || !buffer.length) {
                return reply('❌ Não consegui baixar o áudio para transcrever.')
            }

            const { text, engine } = await transcribeAudio(buffer)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🎙️ *TRANSCRIÇÃO* 🎙️   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📝 *Texto:*\n${text}\n\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        } catch (err) {
            logger.error('[TRANSCREVER ERROR]', err)
            if (err.code === 'WHISPER_NAO_INSTALADO') {
                return reply('⚠️ *Transcrição indisponível:* o motor Whisper não está instalado no servidor.\n\n🔧 *Para o dono:* instale `openai-whisper` (`pip install -U openai-whisper`) ou `whisper.cpp`, e configure `WHISPER_MODEL` no `.env`.')
            }
            return reply(`❌ *Falha na transcrição:* ${err.message}`)
        }
    }
}
