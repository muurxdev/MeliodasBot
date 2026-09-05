/**
 * Comando .baupremiado — Tenta abrir o misterioso baú com código numérico: .baupremiado <codigo>
 */
module.exports = {
    name: "baupremiado",
    aliases: [],
    category: "economy",
    subcategory: "Recompensas",
    description: "Tenta abrir o misterioso baú com código numérico: .baupremiado <codigo>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const cod = parseInt(args[0]);
            const secreto = Math.floor(Math.random() * 5) + 1;
            if (cod === secreto) {
                return reply(`🎉 *SENHA CORRETA!* O baú mágico se abriu e você resgatou 💰 *2.500 Moedas de Ouro*!`);
            }
            return reply(`🔒 *A fechadura permaneceu trancada!* A combinação secreta era diferente.`);
        }
};
