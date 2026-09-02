/**
 * MeliodasBot — Comando .rebaixartodos / .demoteall
 * Rebaixa administradores do grupo em lote de forma segura
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "rebaixartodos",
    aliases: ["demoteall", "tiraradmtodos", "rebaixar-todos"],
    category: "admin",
    description: "Rebaixa administradores do grupo em lote de forma segura",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, from, reply, sender }) => {
        const botName = getBotName();
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (_) {}

        const botJid = client?.user?.id?.split(":")[0] + "@s.whatsapp.net";
        const admins = (meta?.participants || []).filter(p => p.admin && !(p.id || p.jid || String(p)).includes(botJid.split("@")[0]) && !(p.id || p.jid || String(p)).includes(sender.split("@")[0]));

        if (admins.length === 0) return reply("⚠️ Não há outros administradores para rebaixar.");

        const jids = admins.map(p => p.id || p.jid || String(p));
        await reply(`⏳ *Rebaixando ${jids.length} administrador(es)...*`);

        try {
            await client.groupParticipantsUpdate(from, jids.slice(0, 10), "demote");
            return reply(`✅ *Sucesso:* ${Math.min(10, jids.length)} administradores rebaixados a membros comuns!`);
        } catch (err) {
            return reply(`❌ *Erro ao rebaixar:* ${err.message}`);
        }
    }
};

