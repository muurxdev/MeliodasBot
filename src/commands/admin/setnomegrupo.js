/**
 * MeliodasBot — Comando .setnomegrupo / .setsubject
 * Altera o título/nome do grupo diretamente pelo WhatsApp
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "setnomegrupo",
    aliases: ["setsubject", "nomegrupo", "mudarnomegrupo", "setnomeg", "titulogrupo"],
    category: "admin",
    description: "Altera o nome/título do grupo (exige bot admin)",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, text, reply, sender }) => {
        const newName = (text || "").trim();
        const botName = getBotName();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (!newName) {
            return reply(
                "❌ *Informe o novo nome para o grupo!*\n\n" +
                "📌 *Exemplo:* `.setnomegrupo 🐉 Os Sete Pecados Capitais 🐉`\n" +
                "💡 *Limite:* Máximo de 100 caracteres suportados pelo WhatsApp."
            );
        }

        if (newName.length > 100) {
            return reply(`❌ *Nome muito longo:* O nome possui ${newName.length} caracteres (máx: 100).`);
        }

        try {
            await client.groupUpdateSubject(from, newName);
            logger.info(`[GROUP SUBJECT] Grupo ${from} renomeado para "${newName}" por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ✏️ *NOME DO GRUPO ALTERADO* ✏️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 🏷️ ATUALIZAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 📛 *Novo Nome:* ${newName}\n`;
            doc += `┃ 👤 *Alterado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        } catch (err) {
            logger.error("[SETNOMEGRUPO ERROR]", err);
            return reply(`❌ *Falha ao alterar nome do grupo:* ${err.message}`);
        }
    }
};

