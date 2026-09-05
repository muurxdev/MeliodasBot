/**
 * Comando .roletadasorte — Gira a roleta de prêmios da Taverna Boar Hat: .roletadasorte
 */
module.exports = {
    name: "roletadasorte",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Gira a roleta de prêmios da Taverna Boar Hat: .roletadasorte",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const premios = [
                "Cerveja de Bernia (Recupera estamina)",
                "💰 100 Moedas de Ouro",
                "💰 500 Moedas de Ouro",
                "💰 1.500 Moedas de Ouro",
                "Fragmento de Âmbar Sagrado",
                "Prato especial feito por Meliodas (Gosto horrível!)",
                "Sobras mastigadas pelo Hawk",
                "🎟️ Vale-Desconto nas armas de Liones"
            ];
            const p = premios[Math.floor(Math.random() * premios.length)];
            return reply(`🎡 *ROLETA DA SORTE DO BOAR HAT*\n\nA roleta girou... girou... e parou!\n🎁 *Prêmio obtido:* *${p}*!`);
        }
};
