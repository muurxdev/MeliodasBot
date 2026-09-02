/**
 * MeliodasBot — Comando .infogrupo
 * Exibe o dossiê completo e métricas do grupo atual
 */

const dataService = require("../../services/dataService");

module.exports = {
    name: "infogrupo",
    aliases: ["groupinfo", "dadosgrupo", "infogp", "gpinfo"],
    category: "admin",
    description: "Exibe o dossiê completo de inteligência e dados do grupo atual",
    groupOnly: true,
    execute: async ({ client, from, reply }) => {
        try {
            const meta = await client.groupMetadata(from);
            const participants = meta.participants || [];
            const admins = participants.filter(p => p.admin);
            const ownerJid = meta.owner || (meta.id ? meta.id.split("-")[0] + "@s.whatsapp.net" : "Desconhecido");
            const ownerNum = ownerJid.split("@")[0].split(":")[0];

            let inviteLink = "Não disponível";
            try {
                const code = await client.groupInviteCode(from);
                if (code) inviteLink = "https://chat.whatsapp.com/" + code;
            } catch (_) {}

            const allConfigs = dataService.getConfigsData();
            const cfg = allConfigs[from] || {};
            const createdAt = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString("pt-BR") : "Desconhecida";

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║     📁 *DOSSIÊ DO GRUPO* 📁     ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;

            doc += `╭━〔 🏷️ IDENTIFICAÇÃO DO GRUPO 〕━⬣\n`;
            doc += `┃ 📛 *Nome:* ${meta.subject || "Grupo"}\n`;
            doc += `┃ 🆔 *ID:* ${meta.id}\n`;
            doc += `┃ 👑 *Criador:* @${ownerNum}\n`;
            doc += `┃ 📅 *Criado em:* ${createdAt}\n`;
            doc += `┃ 👥 *Membros:* ${participants.length} (${admins.length} admins)\n`;
            doc += `┃ 🔗 *Convite:* ${inviteLink}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

            doc += `╭━〔 🛡️ SEGURANÇA & MÓDULOS 〕━⬣\n`;
            doc += `┃ 🚫 *Anti-Link:* ${cfg.antiLink ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ 🛡️ *Anti-Spam:* ${cfg.antiSpam ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ ⚠️ *Anti-Trava:* ${cfg.antiTrava ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ 🎉 *Boas-Vindas:* ${cfg.welcome ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

            if (meta.desc) {
                doc += `╭━〔 📜 DESCRIÇÃO 〕━⬣\n`;
                doc += `${meta.desc.slice(0, 300)}${meta.desc.length > 300 ? "..." : ""}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            }

            doc += `💡 _Digite \`.admins\` para listar os administradores._`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [ownerJid]
            });
        } catch (err) {
            return reply("❌ *Erro ao obter dados do grupo:* " + err.message);
        }
    }
};
