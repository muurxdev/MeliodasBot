const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'grayscale',
    aliases: ['bw', 'cinza', 'pretoebranco'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Converte uma imagem para escala de cinza',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com *.grayscale* ou *.bw* para converter para cinza.');
        }

        try {
            await reply('⬛ *Convertendo para escala de cinza...*');

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer).grayscale().toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '⬛ Imagem em escala de cinza.'
            }, { quoted: info });

            logger.info(`[GRAYSCALE] Imagem convertida para cinza por ${info.key.participant}`);
        } catch (err) {
            logger.error('[GRAYSCALE ERROR]', err);
            await reply('❌ Falha ao converter imagem: ' + err.message);
        }
    }
};
