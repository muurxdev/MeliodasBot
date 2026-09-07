/**
 * Comando .lembreteme / .lembrete
 * Cria lembretes rápidos no chat com menção automática
 */

module.exports = {
    name: 'lembreteme',
    aliases: ['lembrete', 'lembrar', 'remindme'],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Cria lembretes com notificação por menção no tempo especificado',
    cooldownMs: 3000,
    execute: async ({ reply, args, sender, prefix = '.' }) => {
        const tempoRaw = args[0] || '';
        const recado = args.slice(1).join(' ').trim();

        const match = tempoRaw.match(/^(\d+)(m|h|d)?$/i);
        if (!match || !recado) {
            return reply(`⏰ *Agendador de Lembretes*\n\nUse: \`${prefix}lembreteme <tempo> <recado>\`\n\n💡 *Exemplos:*\n• \`${prefix}lembreteme 15m Beber água\`\n• \`${prefix}lembreteme 2h Olhar o forno\`\n• \`${prefix}lembreteme 1d Renovar assinatura\``);
        }

        const qtd = parseInt(match[1], 10);
        const unidade = (match[2] || 'm').toLowerCase();

        let ms = qtd * 60 * 1000;
        let rotulo = `${qtd} minuto(s)`;
        if (unidade === 'h') {
            ms = qtd * 3600 * 1000;
            rotulo = `${qtd} hora(s)`;
        } else if (unidade === 'd') {
            ms = qtd * 86400 * 1000;
            rotulo = `${qtd} dia(s)`;
        }

        if (ms < 30000) return reply('⚠️ O tempo mínimo de lembrete é 1 minuto.');
        if (ms > 7 * 86400 * 1000) return reply('⚠️ O tempo máximo de lembrete é 7 dias.');

        await reply(`⏰ *Lembrete Agendado com Sucesso!*\n\n📝 *Recado:* _${recado}_\n⏳ *Em:* ${rotulo}\n👤 *Para:* @${sender.split('@')[0]}\n\n🔔 *Avisarei você pontualmente!* `, [sender]);

        setTimeout(async () => {
            try {
                await reply(`🔔 *LEMBRETE ATIVADO!* 🔔\n\n👤 @${sender.split('@')[0]}\n📝 *Seu recado:* _${recado}_\n\n⏰ *Agendado há ${rotulo}.*`, [sender]);
            } catch (_) {}
        }, ms);
    }
};