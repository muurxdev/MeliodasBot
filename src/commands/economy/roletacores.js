/**
 * Comando .roletacores — Aposta nas cores da roleta (vermelho, preto, dourado): .roletacores <cor> <aposta>
 */
module.exports = {
    name: "roletacores",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Aposta nas cores da roleta (vermelho, preto, dourado): .roletacores <cor> <aposta>",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const cor = (args[0] || "").toLowerCase();
            const aposta = parseInt(args[1]) || 100;
            if (!["vermelho", "preto", "dourado"].includes(cor)) return reply("🎡 Uso: `.roletacores <vermelho|preto|dourado> [aposta]`");
            const cores = ["vermelho", "preto", "vermelho", "preto", "dourado"];
            const sorteada = cores[Math.floor(Math.random() * cores.length)];
            let res = `🎡 A roleta parou na cor: *${sorteada.toUpperCase()}*!\n\n`;
            if (cor === sorteada) {
                const mult = sorteada === "dourado" ? 5 : 2;
                res += `🎉 *VITÓRIA!* Você recebeu 💰 *${aposta * mult} moedas*!`;
            } else {
                res += `💀 A sorte não esteve ao seu lado nessa rodada.`;
            }
            return reply(res);
        }
};
