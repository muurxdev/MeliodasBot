/**
 * MeliodasBot — Comando .promovertodos / .promoteall
 * Promove participantes em lote com intervalo seguro anti-ban
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "promovertodos",
    aliases: ["promoteall", "daradmtodos", "promover-todos"],
    category: "admin",
    description: "Promove participantes comuns para administradores em lote com delay seguro",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, from, reply }) => {
        const botName = getBotName();
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (_) {}

        const nonAdmins = (meta?.participants || []).filter(p => !p.admin);
        if (nonAdmins.length === 0) return reply("⚠️ Todos os participantes já são administradores.");

        const jids = nonAdmins.map(p => p.id || p.jid || String(p));
        await reply(`⏳ *Promovendo ${jids.length} membro(s) com intervalo seguro anti-ban...*`);

        try {
            await client.groupParticipantsUpdate(from, jids.slice(0, 10), "promote");
            return reply(`✅ *Sucesso:* ${Math.min(10, jids.length)} membros promovidos a Administradores!`);
        } catch (err) {
            return reply(`❌ *Erro ao promover:* ${err.message}`);
        }
    }
};

