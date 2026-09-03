const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'sketch',
    aliases: ['lapis', 'desenho'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica efeito sketch/lápis em uma imagem',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com *.sketch* para aplicar o efeito lápis.');
        }

        try {
            await reply('✏️ *Aplicando efeito sketch...*');

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const grayscale = await sharp(buffer).grayscale().toBuffer();
            const inverted = await sharp(grayscale).negate().toBuffer();
            const blurred = await sharp(inverted).blur(1).toBuffer();
            const result = await sharp(blurred)
                .compose([{
                    input: grayscale,
                    blend: 'color-dodge'
                }])
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '✏️ Efeito sketch/lápis aplicado.'
            }, { quoted: info });

            logger.info(`[SKETCH] Sketch aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[SKETCH ERROR]', err);
            await reply('❌ Falha ao aplicar sketch: ' + err.message);
        }
    }
};
