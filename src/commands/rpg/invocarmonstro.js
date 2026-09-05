/**
 * Comando .invocarmonstro — Invoca uma criatura das selvas de Britannia: .invocarmonstro
 */
module.exports = {
    name: "invocarmonstro",
    aliases: [],
    category: "rpg",
    subcategory: "Batalha",
    description: "Invoca uma criatura das selvas de Britannia: .invocarmonstro",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const monstros = [
                "Lobo da Floresta Negra (Nível 15)",
                "Cão Tirano das Montanhas (Nível 28)",
                "Salamandra de Fogo de Vaizel (Nível 35)",
                "Wyvern Menor dos Céus de Liones (Nível 42)",
                "Tritão do Lago Sagrado (Nível 50)"
            ];
            const m = monstros[Math.floor(Math.random() * monstros.length)];
            return reply(`🐾 *BESTIÁRIO DE BRITANNIA*\n\nUm monstro selvagem foi encontrado nos arredores!\n👾 *Criatura:* ${m}\nPrepare suas armas para a batalha!`);
        }
};
