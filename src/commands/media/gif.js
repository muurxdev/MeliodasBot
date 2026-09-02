/**
 * MeliodasBot — Comando .gif / .toimg / .tovideo
 * Converte figurinhas (estáticas ou animadas) de volta para Imagem ou Vídeo/GIF, e mídias em figurinhas
 */

const { downloadWhatsAppMedia, converterFigurinhaParaMidia, criarFigurinha } = require('../../services/mediaService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'gif',
    aliases: ['toimg', 'tovideo', 'togif', 'desfig', 'desfazerfigurinha', 'mp4'],
    category: 'media',
    description: 'Converte figurinhas em imagem (estática) ou vídeo/GIF (animada), e mídias em figurinhas',
    cooldownMs: 2000,
    execute: async ({ info, type, from, client, reply }) => {
        const botName = getBotName();
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        const isSticker = type === 'stickerMessage';
        const isQuotedSticker = !!quoted?.stickerMessage;
        const isImage = type === 'imageMessage';
        const isQuotedImage = !!quoted?.imageMessage;
        const isVideo = type === 'videoMessage';
        const isQuotedVideo = !!quoted?.videoMessage;

        if (!isSticker && !isQuotedSticker && !isImage && !isQuotedImage && !isVideo && !isQuotedVideo) {
            return reply('❌ *Uso:* Responda a uma figurinha (estática ou animada) com *.gif* ou *.toimg* para transformá-la em mídia!');
        }

        try {
            // CASO 1: CONVERTER FIGURINHA EM MÍDIA (VÍDEO MP4 / IMAGEM PNG)
            if (isSticker || isQuotedSticker) {
                await reply('⏳ *Convertendo figurinha para mídia (Imagem/Vídeo)...* Aguarde.');

                // Passa o objeto completo ou o nó de figurinha para o download resiliente
                const targetWrapper = isSticker ? info : {
                    key: {
                        remoteJid: from,
                        id: contextInfo?.stanzaId,
                        participant: contextInfo?.participant
                    },
                    message: quoted
                };

                const isStickerAnimatedHint = Boolean(
                    info.message?.stickerMessage?.isAnimated ||
                    quoted?.stickerMessage?.isAnimated ||
                    contextInfo?.quotedMessage?.stickerMessage?.isAnimated
                );

                const buffer = await downloadWhatsAppMedia(targetWrapper, 'sticker', client);
                const converted = await converterFigurinhaParaMidia(buffer, isStickerAnimatedHint);

                if (converted.type === 'video') {
                    let captionDoc = `╔══════════════════════════════╗\n`;
                    captionDoc += `║   🎬 *GIF / VÍDEO EXTRAÍDO* 🎬   ║\n`;
                    captionDoc += `╚══════════════════════════════╝\n\n`;
                    captionDoc += `✨ *Figurinha animada convertida com sucesso!*\n`;
                    captionDoc += `📦 *Formato:* MP4 Animado (GIF Playback)\n\n`;
                    captionDoc += `👑 *${botName}*`;

                    await client.sendMessage(from, {
                        video: converted.buffer,
                        gifPlayback: true,
                        caption: captionDoc.trim()
                    }, { quoted: info });
                } else {
                    let captionDoc = `╔══════════════════════════════╗\n`;
                    captionDoc += `║    🖼️ *IMAGEM EXTRAÍDA* 🖼️    ║\n`;
                    captionDoc += `╚══════════════════════════════╝\n\n`;
                    captionDoc += `✨ *Figurinha estática convertida com sucesso!*\n`;
                    captionDoc += `📦 *Formato:* Imagem PNG Alta Resolução\n\n`;
                    captionDoc += `👑 *${botName}*`;

                    await client.sendMessage(from, {
                        image: converted.buffer,
                        caption: captionDoc.trim()
                    }, { quoted: info });
                }

                return logger.info(`[GIF COMMAND] Figurinha convertida com sucesso (${converted.type}) em ${from}`);
            }

            // CASO 2: CONVERTER VÍDEO OU IMAGEM EM FIGURINHA
            await reply('⏳ *Processando mídia para figurinha...* Aguarde.');
            const isAnimated = isVideo || isQuotedVideo;

            const targetWrapper = (isImage || isVideo) ? info : {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const buffer = await downloadWhatsAppMedia(targetWrapper, isAnimated ? 'video' : 'image', client);
            const stickerBuffer = await criarFigurinha(buffer, isAnimated, botName, 'GIF & Mídia');

            await client.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: info });

            logger.info(`[GIF COMMAND] Mídia convertida em figurinha (${isAnimated ? 'animada' : 'estática'}) em ${from}`);
        } catch (err) {
            logger.error('[GIF COMMAND ERROR]', err);
            await reply(`❌ *Erro na conversão:* ${err.message}`);
        }
    }
};
