/**
 * MeliodasBot — Comando .hidetag / .marcar / .ghosttag
 * Marca todos os participantes do grupo de forma oculta/fantasma
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "hidetag",
    aliases: ["marcar", "ghosttag", "marcafantasma", "notificartodos"],
    category: "admin",
    description: "Menciona todos os membros do grupo de forma oculta (notificação fantasma)",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, text, quotedText, reply, info }) => {
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (_) {}

        const participants = meta?.participants || [];
        if (participants.length === 0) return reply("❌ Nenhum participante encontrado.");

        const msg = (text || quotedText || "📢 Notificação importante para todos os participantes!").trim();
        const jids = participants.map(p => p.id || p.jid || String(p));

        return client.sendMessage(from, { text: msg, mentions: jids }, { quoted: info });
    }
};
