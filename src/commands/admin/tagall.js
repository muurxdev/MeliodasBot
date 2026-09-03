/**
 * Comando .tagall / .todos / .marcartodos
 * Marca todos os participantes do grupo com layout formatado e menções reais
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "tagall",
    aliases: ["todos", "marcartodos", "marcar-todos", "tag-all", "marcatodos"],
    category: "admin",
    description: "Menciona todos os membros do grupo com mensagem personalizada",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 4000,
    execute: async ({ client, from, text, quotedText, reply, sender }) => {
        const botName = getBotName();
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (_) {}

        const participants = meta?.participants || [];
        if (participants.length === 0) return reply("❌ Não foi possível carregar os participantes.");

        const msg = (text || quotedText || "Atenção a todos os membros do grupo!").trim();
        const jids = participants.map(p => p.id || p.jid || String(p));
        const senderNum = sender.split("@")[0].split(":")[0];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📢 *CONVOCAÇÃO GERAL* 📢   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💬 *Mensagem:* ${msg}\n`;
        doc += `👤 *Convocado por:* @${senderNum}\n`;
        doc += `👥 *Total de Membros:* ${participants.length}\n\n`;
        doc += `╭━〔 📋 LISTA DE PARTICIPANTES 〕━⬣\n`;

        participants.forEach(p => {
            const jid = p.id || p.jid || String(p);
            const num = jid.split("@")[0].split(":")[0];
            doc += `┃ ➤ @${num}\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return client.sendMessage(from, { text: doc.trim(), mentions: jids });
    }
};
