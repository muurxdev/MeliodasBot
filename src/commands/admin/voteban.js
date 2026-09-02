/**
 * MeliodasBot — Comando .voteban
 * Inicia uma votação democrática de banimento de participante no grupo
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "voteban",
    aliases: ["votacaoban", "votarban", "pollban"],
    category: "admin",
    description: "Inicia uma votação democrática no grupo para banir um participante",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply, info, sender }) => {
        const botName = getBotName();
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
        const target = contextInfo?.mentionedJid?.[0];

        if (!target) {
            return reply("❌ *Mencione o usuário que deseja colocar em votação de ban!*\n\n📌 *Exemplo:* `.voteban @usuario`");
        }

        const targetNum = target.split("@")[0].split(":")[0];
        const reqVotes = 5;

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🗳️ *VOTAÇÃO DE BANIMENTO* 🗳️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⚠️ Uma votação de banimento foi aberta para: @${targetNum}\n\n`;
        doc += `╭━〔 📊 PLACAR DE VOTOS 〕━⬣\n`;
        doc += `┃ 🔴 *Banir:* 1 / ${reqVotes} votos necessários\n`;
        doc += `┃ 🟢 *Perdoar:* 0 votos\n`;
        doc += `┃ ⏱️ *Duração da Votação:* 5 minutos\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Para votar, envie:_ \`.votar sim\` _ou_ \`.votar nao\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [target]);
    }
};

