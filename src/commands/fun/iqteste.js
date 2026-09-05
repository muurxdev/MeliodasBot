/**
 * Comando .iqteste — Mede o QI humorístico do usuário ou de alguém marcado
 */
module.exports = {
    name: "iqteste",
    aliases: ["mediriq"],
    category: "fun",
    subcategory: "Jogos",
    description: "Mede o QI humorístico do usuário ou de alguém marcado",
    cooldownMs: 2000,
    execute: async ({ sender, info, reply }) => {
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = mentioned || sender;
            const iq = Math.floor(Math.random() * 160) + 40;
            let diag = '';
            if (iq > 140) diag = '🧠 Gênio absoluto nível Merlin de Britânia!';
            else if (iq > 115) diag = '💡 Inteligência acima da média, raciocínio afiado.';
            else if (iq > 90) diag = '⚖️ Intelecto equilibrado dentro do esperado.';
            else if (iq > 70) diag = '🐷 Nível Hawk: pensa mais em comida do que em contas.';
            else diag = '🪨 Cérebro de pedra rústica.';
            return reply(`🧠 *TESTE DE QI*\n\nAlvo: @${target.split('@')[0]}\n*QI Avaliado:* *${iq}*\n${diag}`, [target]);
        }
};
