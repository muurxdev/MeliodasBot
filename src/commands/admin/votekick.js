/**
 * MeliodasBot — Comando .votekick
 * Inicia uma votação democrática no grupo para expulsar temporariamente um participante
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "votekick",
    aliases: ["votarexpulsao", "kickvote", "votoexpulsar"],
    category: "admin",
    description: "Inicia uma votação de expulsão democrática para um participante",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply, info, sender }) => {
        const botName = getBotName();
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
        const target = contextInfo?.mentionedJid?.[0];

        if (!target) {
            return reply("❌ *Mencione o participante que deseja colocar em votação de expulsão!*\n\n📌 *Exemplo:* `.votekick @usuario`");
        }

        const targetNum = target.split("@")[0].split(":")[0];
        const reqVotes = 4;

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   👢 *VOTAÇÃO DE EXPULSÃO* 👢   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👢 Proposta de expulsão aberta contra: @${targetNum}\n\n`;
        doc += `╭━〔 📊 VOTAÇÃO EM ANDAMENTO 〕━⬣\n`;
        doc += `┃ 👢 *Expulsar:* 1 / ${reqVotes} votos\n`;
        doc += `┃ 🛡️ *Manter no Grupo:* 0 votos\n`;
        doc += `┃ ⏱️ *Tempo Limite:* 3 minutos\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [target]);
    }
};

