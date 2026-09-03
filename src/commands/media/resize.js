const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'resize',
    aliases: ['redimensionar', 'tamanho'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Redimensiona uma imagem mantendo proporção (1 valor) ou distort (2 valores)',
    cooldownMs: 5000,
    execute: async ({ info, text, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com *.resize <largura> [altura]* para redimensionar.');
        }

        const parts = (text || '').trim().split(/\s+/);
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);

        if (!width || width <= 0) {
            return reply('❌ Uso: *.resize <largura> [altura]*\n• Um valor: mantém proporção\n• Dois valores: redimensiona exato');
        }

        try {
            await reply('📐 *Redimensionando imagem...*');

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let result;
            if (height && height > 0) {
                result = await sharp(buffer).resize(width, height).toBuffer();
            } else {
                result = await sharp(buffer).resize(width).toBuffer();
            }

            const metadata = await sharp(result).metadata();

            await client.sendMessage(from, {
                image: result,
                caption: `📐 Imagem redimensionada para ${metadata.width}x${metadata.height}.`
            }, { quoted: info });

            logger.info(`[RESIZE] Imagem redimensionada por ${info.key.participant}`);
        } catch (err) {
            logger.error('[RESIZE ERROR]', err);
            await reply('❌ Falha ao redimensionar imagem: ' + err.message);
        }
    }
};
