const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'pixelart',
    aliases: ['pixel', 'pixelizar'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica efeito pixel art em uma imagem',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com *.pixelart* para aplicar o efeito pixel art.');
        }

        try {
            await reply('👾 *Aplicando efeito pixel art...*');

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer)
                .resize(64, 64, { fit: 'fill' })
                .resize(512, 512, { kernel: 'nearest' })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '👾 Efeito pixel art aplicado.'
            }, { quoted: info });

            logger.info(`[PIXELART] Pixel art aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[PIXELART ERROR]', err);
            await reply('❌ Falha ao aplicar pixel art: ' + err.message);
        }
    }
};
