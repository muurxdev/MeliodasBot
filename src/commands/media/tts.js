/**
 * Comando .tts / .voz
 * Converte texto em mensagem de áudio / nota de voz interativa
 */

const fs = require('fs')
const { generateTTS } = require('../../services/aiService')
const logger = require('../../core/logger')

module.exports = {
    name: 'tts',
    aliases: ['voz', 'falar', 'audio', 'say', 'fala'],
    category: 'media',
    description: 'Converte texto em áudio / mensagem de voz falada',
    cooldownMs: 2000,
    execute: async ({ text, args = [], client, from, reply, info, quotedText }) => {
        const cleanText = (text || quotedText || args.join(' ')).trim()

        if (!cleanText) {
            return reply('🗣️ *SÍNTESE DE VOZ / TTS*\n\nDigite o texto que deseja transformar em áudio.\n\n📌 *Exemplo:* `.tts Olá, tudo bem com vocês?`\n\n💡 *Dica:* Você também pode responder a qualquer mensagem com `.tts`!')
        }

        try {
            const audioPath = await generateTTS(cleanText)
            const audioBuffer = fs.readFileSync(audioPath)

            await client.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: info })

            try { fs.unlinkSync(audioPath) } catch (_) {}
        } catch (err) {
            logger.error('[TTS ERROR]', err)
            return reply(`❌ *Falha ao gerar áudio de voz:* ${err.message}`)
        }
    }
}

