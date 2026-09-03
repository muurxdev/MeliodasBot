/**
 * Comando .unmute
 * Remove o silenciamento de um membro no grupo
 */

const { getDatabase } = require("../../database/connection");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "unmute",
    aliases: ["dessilenciar", "desmutar", "falar"],
    category: "admin",
    description: "Remove o silenciamento de um usuário no grupo",
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args, mentioned, info, reply, isOwner, isAdmin, sender }) => {
        const botName = getBotName();
        if (!isAdmin && !isOwner) {
            return reply("🚫 *Apenas administradores podem dessilenciar membros.*");
        }

        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        const argNum = (args && args[0]) ? args[0].replace(/[@\s]/g, "").replace(/\D/g, "") : "";
        const targetJid = mentioned || quotedParticipant || (argNum ? (argNum + "@s.whatsapp.net") : null);

        if (!targetJid) {
            return reply("❌ *Uso incorreto:* Marque a mensagem ou usuário com `.unmute @usuario`");
        }

        const targetNum = targetJid.split("@")[0].split(":")[0];
        const senderNum = sender.split("@")[0].split(":")[0];
        const db = getDatabase();

        try {
            db.prepare(`
                DELETE FROM muted_members WHERE group_jid = ? AND user_jid = ?
            `).run(from, targetJid);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔊 *MODERAÇÃO & VOZ LIBERADA* 🔊   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DE PARTICIPANTE 〕━⬣\n`;
            doc += `┃ 👤 *Usuário Dessilenciado:* @${targetNum}\n`;
            doc += `┃ 🔊 *Estado:* *VOZ LIBERADA NO GRUPO*\n`;
            doc += `┃ 🛡️ *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para silenciar novamente:_ \`.mute @${targetNum}\`\n`;
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
