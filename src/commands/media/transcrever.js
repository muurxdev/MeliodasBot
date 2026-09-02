const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'transcrever',
    aliases: ['ouvir', 'stt', 'transcricao', 'audiotexto'],
    category: 'media',
    description: 'Transcreve áudios e mensagens de voz em texto com IA',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        return reply('🎙️ *Transcrição de Áudio:* Responda a um áudio com `.transcrever` para converter voz em texto.');
    }
};