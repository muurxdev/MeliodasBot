/**
 * Comando .botopen
 * Reabre o bot imediatamente ou programa um horário de abertura
 */

const { openImmediately, scheduleCloseAtTime } = require('../../services/botScheduler');
const { ROLES } = require('../../services/permissionService');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'botopen',
    aliases: ['abrirbot', 'abrir', 'openbot'],
    category: 'owner',
    description: 'Reabre o bot imediatamente ou programa um horário de abertura (ex: .botopen ou .botopen 07:00)',
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const timeArg = args[0];
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Admin";

        if (timeArg && timeArg.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)) {
            try {
                const now = new Date();
                const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                const res = scheduleCloseAtTime(nowStr, timeArg, sender);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🟢 *REABERTURA AGENDADA* 🟢   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ PROGRAMAÇÃO DO BOT 〕━⬣\n`;
                doc += `┃ 🟢 *Abertura Programada:* *${res.reopenFormatted}*\n`;
                doc += `┃ 👤 *Agendado por:* @${senderNum}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Para reabrir imediatamente:_ \`.botopen\`\n`;
                doc += `👑 *${botName}*`;

                return reply(doc.trim(), sender ? [sender] : []);
            } catch (err) {
                return reply(`❌ ${err.message}`);
            }
        }

        // Abertura imediata
        openImmediately(sender);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🟢 *BOT REABERTO COM SUCESSO* 🟢   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ ESTADO OPERACIONAL 〕━⬣\n`;
        doc += `┃ 🟢 *Status:* *ONLINE & OPERACIONAL*\n`;
        doc += `┃ 💬 *Comandos:* Totalmente liberados\n`;
        doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Para fechar temporariamente:_ \`.botclose 30m\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), sender ? [sender] : []);
    }
};
