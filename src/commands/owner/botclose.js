/**
 * Comando .botclose
 * Controla o fechamento temporário, programado ou imediato do bot
 */

const { scheduleCloseDuration, scheduleCloseAtTime, scheduleCloseIndefinite } = require('../../services/botScheduler');
const { ROLES } = require('../../services/permissionService');
const { getBotName } = require('../../config/botConfig');
const { gracefulShutdown } = require('../../core/shutdown');
const logger = require('../../core/logger');

const pendingConfirmations = new Set();

module.exports = {
    name: 'botclose',
    aliases: ['fecharbot', 'fechar', 'closebot'],
    category: 'owner',
    description: 'Fecha o bot temporariamente (ex: .botclose 30m, .botclose 23:00 07:00, .botclose indefinite, .botclose now)',
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Admin";

        if (!args[0]) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔒 *CICLO DE VIDA DO BOT* 🔒   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ COMANDOS DISPONÍVEIS 〕━⬣\n`;
            doc += `┃ • \`.botclose 30m\` — Fecha por 30 minutos e reabre\n`;
            doc += `┃ • \`.botclose 2h\` — Fecha por 2 horas e reabre\n`;
            doc += `┃ • \`.botclose 23:00 07:00\` — Fecha às 23h e reabre às 07h\n`;
            doc += `┃ • \`.botclose indefinite\` — Fecha até .botopen manual\n`;
            doc += `┃ • \`.botclose now\` — Encerra processo na VPS com confirmação\n`;
            doc += `┃ • \`.botopen\` — Reabre o bot imediatamente\n`;
            doc += `┃ • \`.botschedule\` — Consulta agendamentos ativos\n`;
            doc += `┃ • \`.botcancel\` — Cancela agendamento futuro\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        const arg1 = args[0].toLowerCase();

        // 1. Fechamento Imediato do Processo (.botclose now / .botclose confirm)
        if (arg1 === 'now' || arg1 === 'agora') {
            pendingConfirmations.add(sender);
            return reply(`⚠️ *CONFIRMAÇÃO NECESSÁRIA*\n\nO bot será completamente encerrado imediatamente.\n\nPara confirmar, envie:\n👉 *.botclose confirm*`);
        }

        if (arg1 === 'confirm' || arg1 === 'confirmar') {
            if (!pendingConfirmations.has(sender)) {
                return reply('❌ Nenhuma solicitação de encerramento pendente.');
            }
            pendingConfirmations.delete(sender);
            await reply('🛑 *ENCERRANDO PROCESSO...* O bot será desligado com segurança agora.');
            logger.info(`[BOT_CLOSE] Encerramento imediato solicitado por ${sender}`);
            setTimeout(() => {
                gracefulShutdown('COMMAND_BOTCLOSE_NOW', 0);
            }, 1000);
            return;
        }

        // 2. Fechamento Indefinido (.botclose indefinite)
        if (arg1 === 'indefinite' || arg1 === 'indefinido') {
            scheduleCloseIndefinite(sender);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔒 *CICLO DE VIDA DO BOT* 🔒   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ ESTADO OPERACIONAL 〕━⬣\n`;
            doc += `┃ 🔴 *Status:* *OFFLINE INDEFINIDO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `┃ 🔒 *Modo:* Comandos bloqueados para não-donos\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reabrir o bot:_ \`.botopen\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        }

        // 3. Fechamento por Duração (ex: .botclose 30m, 2h, 1d)
        if (arg1.match(/^\d+[smhd]$/i)) {
            try {
                const res = scheduleCloseDuration(arg1, sender);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║ 🔒 *BOT FECHADO TEMPORARIAMENTE* 🔒 ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ FECHAMENTO TEMPORÁRIO 〕━⬣\n`;
                doc += `┃ ⏱️ *Duração:* ${res.durationStr}\n`;
                doc += `┃ 🔄 *Reabertura em:* *${res.reopenAtFormatted}*\n`;
                doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Para reabrir antes do prazo:_ \`.botopen\`\n`;
                doc += `👑 *${botName}*`;

                return reply(doc.trim(), sender ? [sender] : []);
            } catch (err) {
                return reply(`❌ ${err.message}`);
            }
        }

        // 4. Fechamento por Horário (ex: .botclose 23:00 ou .botclose 23:00 07:00)
        if (arg1.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)) {
            const arg2 = args[1];
            try {
                const res = scheduleCloseAtTime(arg1, arg2, sender);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   ⏰ *AGENDAMENTO DE BOT* ⏰   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ HORÁRIOS PROGRAMADOS 〕━⬣\n`;
                doc += `┃ 🔴 *Fechamento:* *${res.closeFormatted}*\n`;
                doc += `┃ 🟢 *Reabertura:* *${res.reopenFormatted}*\n`;
                doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Para cancelar o agendamento:_ \`.botcancel\`\n`;
                doc += `👑 *${botName}*`;

                return reply(doc.trim(), sender ? [sender] : []);
            } catch (err) {
                return reply(`❌ ${err.message}`);
            }
        }

        return reply('❌ Argumento inválido. Use `.botclose` sem argumentos para ver os exemplos.');
    }
};
