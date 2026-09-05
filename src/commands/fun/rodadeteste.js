/**
 * Comando .rodadeteste — Testa a afinidade com um membro ou crush: .rodadeteste [nome]
 */
module.exports = {
    name: "rodadeteste",
    aliases: [],
    category: "fun",
    subcategory: "Brincadeiras",
    description: "Testa a afinidade com um membro ou crush: .rodadeteste [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const nome = args.join(" ") || "Alguém misterioso";
            const pct = Math.floor(Math.random() * 101);
            let frase = "";
            if (pct > 80) frase = "🔥 Amor arrebatador digno de Meliodas e Elizabeth!";
            else if (pct > 50) frase = "✨ Amizade forte e companheirismo leal.";
            else if (pct > 20) frase = "⚠️ Clima tenso... melhor manter a distância de segurança!";
            else frase = "💀 Incompatibilidade total, pior que Ban e King discutindo!";
            return reply(`💘 *MEDIDOR DE AFINIDADE*\nCom: *${nome}*\nCompatibilidade: *${pct}%*\n${frase}`);
        }
};
