/**
 * Comando .fig / .sticker / .s
 * Converte imagens ou vídeos curtos em figurinhas do WhatsApp
 */

const { downloadWhatsAppMedia, criarFigurinha } = require('../../services/mediaService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'fig',
    aliases: ['s', 'sticker', 'figurinha', 'f'],
    category: 'media',
    description: 'Converte imagens ou vídeos curtos em figurinhas do WhatsApp com metadados',
    cooldownMs: 2000,
    execute: async ({ info, type, from, client, reply }) => {
        const botName = getBotName();
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        const isImage = type === 'imageMessage';
        const isVideo = type === 'videoMessage';
        const isQuotedImage = !!quoted?.imageMessage;
        const isQuotedVideo = !!quoted?.videoMessage;

        if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) {
            return reply('❌ *Uso:* Envie uma imagem/vídeo com a legenda *.fig* ou responda a uma imagem/vídeo com *.fig*');
        }

        const isAnimated = isVideo || isQuotedVideo;
        const mediaMsg = isImage ? info.message.imageMessage : isVideo ? info.message.videoMessage : isQuotedImage ? quoted.imageMessage : quoted.videoMessage;

        // Se for vídeo, limita a 15 segundos
        if (isAnimated && mediaMsg?.seconds && mediaMsg.seconds > 15) {
            return reply('❌ O vídeo/GIF para figurinha animada deve ter no máximo 15 segundos.');
        }

        try {
            await reply('⏳ *Criando figurinha...* Aguarde.');

            const targetWrapper = (isImage || isVideo) ? info : {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const buffer = await downloadWhatsAppMedia(targetWrapper, isAnimated ? 'video' : 'image', client);
            const stickerBuffer = await criarFigurinha(buffer, isAnimated, botName, botName);

            await client.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: info });
        } catch (err) {
            logger.error('[FIG COMMAND ERROR]', err);
            await reply(`❌ *Falha ao criar figurinha:* ${err.message}`);
        }
    }
};