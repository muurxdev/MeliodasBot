/**
 * Comando .unmute / .desmutar / .dessilenciar
 * Remove o silenciamento de um membro ou de todos no grupo
 */

const muteService = require("../../services/muteService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "unmute",
    aliases: ["dessilenciar", "desmutar", "tirarmute", "resetmute"],
    category: "admin",
    description: "Remove o silenciamento de um usuário ou de todos no grupo",
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args = [], mentioned, info, reply, isOwner, isAdmin, sender, prefix = '.' }) => {
        const botName = getBotName();
        if (!isAdmin && !isOwner) {
            return reply("🚫 *Apenas administradores podem dessilenciar membros.*");
        }

        const sub = (args[0] || '').toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        // 1. Resetar todos os silenciados do grupo (.unmute all / .unmute todos)
        if (['all', 'todos', 'tudo', 'reset'].includes(sub)) {
            const count = muteService.resetAllMutes(from);
            return reply(`🔊 *SILENCIAMENTOS REVOGADOS!*\n\nTodos os membros do grupo tiveram a voz liberada (${count} membro(s) desmutado(s)).`);
        }

        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        const argNum = (args && args[0]) ? args[0].replace(/[@\s]/g, "").replace(/\D/g, "") : "";
        const targetJid = mentioned || quotedParticipant || (argNum ? (argNum + "@s.whatsapp.net") : null);

        if (!targetJid) {
            return reply(`❌ *Uso:* \`${prefix}unmute @usuario\` ou \`${prefix}unmute all\` para liberar todos.`);
        }

        const targetNum = targetJid.split("@")[0].split(":")[0];

        try {
            muteService.unmuteUser(from, targetJid);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔊 *VOZ LIBERADA NO GRUPO* 🔊   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DE PARTICIPANTE 〕━⬣\n`;
            doc += `┃ 👤 *Usuário Liberado:* @${targetNum}\n`;
            doc += `┃ 🔊 *Estado:* *DESMUTADO*\n`;
            doc += `┃ 🛡️ *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [targetJid, sender]
            });
        } catch (err) {
            return reply("❌ *Erro ao dessilenciar membro:* " + err.message);
        }
    }
};
