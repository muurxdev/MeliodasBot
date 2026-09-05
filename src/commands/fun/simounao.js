/**
 * Comando .simounao — Responde sua dúvida com Sim, Não ou Talvez: .simounao <pergunta>
 */
module.exports = {
    name: "simounao",
    aliases: [],
    category: "fun",
    subcategory: "Oráculo",
    description: "Responde sua dúvida com Sim, Não ou Talvez: .simounao <pergunta>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (!args.length) return reply("❓ Pergunte algo para o Oráculo: `.simounao Devo almoçar agora?`");
            const r = ["✅ SIM, com certeza absoluta!", "❌ NÃO, de jeito nenhum!", "🔮 TALVEZ, os ventos ainda são incertos...", "👀 Nem Meliodas sabe a resposta dessa."];
            return reply(`🔮 *ORÁCULO DO DESTINO*\n\nPergunta: "${args.join(" ")}"\nResposta: *${r[Math.floor(Math.random() * r.length)]}*`);
        }
};
