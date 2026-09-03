const logger = require('../../core/logger');
const dataService = require('../../services/dataService');

module.exports = {
    name: 'lembrete',
    aliases: ['reminder', 'lembrar', 'alerta'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Cria um lembrete para ser disparado após um tempo',
    cooldownMs: 5000,
    execute: async ({ args, text, reply, sender, from, client }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.lembrete <tempo> <mensagem>`\n\n' +
                '📌 *Formatos de tempo:*\n' +
                '• `30m` — 30 minutos\n' +
                '• `2h` — 2 horas\n' +
                '• `1d` — 1 dia\n\n' +
                '📌 *Exemplo:* `.lembrete 30m Reunião com o time`'
            );
        }

        const match = input.match(/^(\d+)\s*(m|h|d)\s+(.+)/i);
        if (!match) return reply('❌ Formato inválido. Use: `<tempo> <mensagem>` (ex: `30m Reunião`).');

        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        const message = match[3].trim();

        if (amount <= 0) return reply('❌ O tempo deve ser maior que zero.');

        let ms;
        let unitLabel;
        switch (unit) {
            case 'm': ms = amount * 60 * 1000; unitLabel = 'minuto(s)'; break;
            case 'h': ms = amount * 60 * 60 * 1000; unitLabel = 'hora(s)'; break;
            case 'd': ms = amount * 24 * 60 * 60 * 1000; unitLabel = 'dia(s)'; break;
            default: return reply('❌ Unidade inválida. Use `m` (minutos), `h` (horas) ou `d` (dias).');
        }

        const triggerAt = Date.now() + ms;

        const configs = dataService.getConfigsData();
        if (!configs.reminders) configs.reminders = [];

        configs.reminders.push({
            sender,
            from,
            message,
            triggerAt,
            createdAt: Date.now()
        });

        await dataService.saveConfigsData(configs);

        const schedule = () => {
            const now = Date.now();
            const remaining = triggerAt - now;
            if (remaining <= 0) return;

            setTimeout(async () => {
                try {
                    const number = sender.split('@')[0];
                    await client.sendMessage(from, { text: `⏰ *Lembrete para @${number}*\n\n📝 ${message}`, mentions: [sender] });
                    const cfg = dataService.getConfigsData();
                    cfg.reminders = (cfg.reminders || []).filter(r => r.triggerAt !== triggerAt || r.sender !== sender);
                    await dataService.saveConfigsData(cfg);
                } catch (err) {
                    logger.warn('[LEMBRETE] Falha ao enviar lembrete:', err.message);
                }
            }, remaining);
        };
        schedule();

        return reply(
            `✅ *Lembrete criado!*\n\n` +
            `📝 *Mensagem:* ${message}\n` +
            `⏰ *Dispara em:* ${amount} ${unitLabel}\n` +
            `📅 *Agendado para:* ${new Date(triggerAt).toLocaleString('pt-BR')}`
        );
    }
};
