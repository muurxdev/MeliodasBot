/**
 * Comando .duelosorte — Disputa cara ou coroa mágico valendo moedas: .duelosorte <cara/coroa> <aposta>
 */
module.exports = {
    name: "duelosorte",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Disputa cara ou coroa mágico valendo moedas: .duelosorte <cara/coroa> <aposta>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const escolha = (args[0] || "").toLowerCase();
            const aposta = parseInt(args[1]) || 50;
            if (!["cara", "coroa"].includes(escolha)) return reply("🪙 *Cara ou Coroa Mágico*\nUso: `.duelosorte <cara|coroa> [aposta]`");
            const sorteio = Math.random() > 0.5 ? "cara" : "coroa";
            if (escolha === sorteio) {
                return reply(`🪙 A moeda dourada caiu em *${sorteio.toUpperCase()}*!\n🎉 *Você ganhou 💰 ${aposta * 2} moedas!*`);
            }
            return reply(`🪙 A moeda dourada caiu em *${sorteio.toUpperCase()}*!\n💀 Você perdeu 💰 ${aposta} moedas.`);
        }
};
