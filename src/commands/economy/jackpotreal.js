/**
 * Comando .jackpotreal — Verifica o valor acumulado do Mega Jackpot de Liones: .jackpotreal
 */
module.exports = {
    name: "jackpotreal",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Verifica o valor acumulado do Mega Jackpot de Liones: .jackpotreal",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const acumulado = Math.floor(Math.random() * 200000) + 150000;
            return reply(`🏆💰 *MEGA JACKPOT DE LIONES*\n\nPrêmio acumulado atual:\n🔥 *💰 ${acumulado.toLocaleString('pt-BR')} MOEDAS DE OURO!* 🔥\nJogue na `.loteriasds` para concorrer!`);
        }
};
