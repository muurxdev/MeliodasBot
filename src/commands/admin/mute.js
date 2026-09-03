/**
 * Comando .mute
 * Silencia um membro no grupo (registrado no SQLite)
 */

const { getDatabase } = require("../../database/connection");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "mute",
    aliases: ["silenciar", "mutar", "calaboca"],
    category: "admin",
    description: "Silencia um usuário no grupo",
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args, mentioned, info, reply, isOwner, isAdmin, sender }) => {
        const botName = getBotName();
        if (!isAdmin && !isOwner) {
            return reply("🚫 *Apenas administradores podem silenciar membros.*");
        }

        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        const argNum = (args && args[0]) ? args[0].replace(/[@\s]/g, "").replace(/\D/g, "") : "";
        const targetJid = mentioned || quotedParticipant || (argNum ? (argNum + "@s.whatsapp.net") : null);

        if (!targetJid) {
            return reply("❌ *Uso incorreto:* Marque a mensagem ou usuário com `.mute @usuario`");
        }

        const targetNum = targetJid.split("@")[0].split(":")[0];
        const senderNum = sender.split("@")[0].split(":")[0];
        const db = getDatabase();

        try {
            db.prepare(`
                CREATE TABLE IF NOT EXISTS muted_members (
                    group_jid TEXT,
                    user_jid TEXT,
                    muted_by TEXT,
                    created_at INTEGER,
                    PRIMARY KEY (group_jid, user_jid)
                )
            `).run();

            db.prepare(`
                INSERT OR REPLACE INTO muted_members (group_jid, user_jid, muted_by, created_at)
                VALUES (?, ?, ?, ?)
            `).run(from, targetJid, sender, Date.now());

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔇 *MODERAÇÃO & SILÊNCIO* 🔇   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DE PARTICIPANTE 〕━⬣\n`;
            doc += `┃ 👤 *Usuário Silenciado:* @${targetNum}\n`;
            doc += `┃ 🔇 *Estado:* *MUTADO NO GRUPO*\n`;
            doc += `┃ 🛡️ *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para remover o silenciamento:_ \`.unmute @${targetNum}\`\n`;
            doc += `👑 *${botName}*`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [targetJid, sender]
            });
        } catch (err) {
            return reply("❌ *Erro ao silenciar membro:* " + err.message);
        }
    }
};
