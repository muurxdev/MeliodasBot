const logger = require('../../core/logger');

module.exports = {
    name: 'timer',
    aliases: ['cronometro', 'temporizador', 'countdowntimer'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Inicia um timer regressivo que avisa ao terminar',
    cooldownMs: 3000,
    execute: async ({ args, text, reply, sender, from, client }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.timer <tempo>`\n\n' +
                '📌 *Formatos:*\n' +
                '• `5m` — 5 minutos\n' +
                '• `2h` — 2 horas\n\n' +
                '📌 *Exemplo:* `.timer 5m`'
            );
        }

        const match = input.match(/^(\d+)\s*(m|h)$/i);
        if (!match) return reply('❌ Formato inválido. Use `Xm` (minutos) ou `Xh` (horas).');

        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();

        if (amount <= 0) return reply('❌ O tempo deve ser maior que zero.');

        let ms;
        let label;
        switch (unit) {
            case 'm': ms = amount * 60 * 1000; label = `${amount} minuto(s)`; break;
            case 'h': ms = amount * 60 * 60 * 1000; label = `${amount} hora(s)`; break;
            default: return reply('❌ Unidade inválida.');
        }

        setTimeout(async () => {
            try {
                const number = sender.split('@')[0];
                await client.sendMessage(from, {
                    text: `⏰ *Timer finalizado!*\n\n⏱️ O timer de *${label}* acabou.\n\n@${number}`,
                    mentions: [sender]
                });
            } catch (err) {
                logger.warn('[TIMER] Falha ao enviar notificação:', err.message);
            }
        }, ms);

        return reply(`✅ *Timer iniciado!*\n\n⏱️ *Duração:* ${label}\n🔔 Você será notificado quando terminar.`);
    }
};
