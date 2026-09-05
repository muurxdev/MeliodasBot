/**
 * Comando .forjamoedas — Cunha novas moedas na casa da moeda real: .forjamoedas
 */
module.exports = {
    name: "forjamoedas",
    aliases: [],
    category: "economy",
    subcategory: "Forja",
    description: "Cunha novas moedas na casa da moeda real: .forjamoedas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const cunhadas = Math.floor(Math.random() * 800) + 300;
            return reply(`⚒️🪙 *CUNHAGEM REAL*\n\nAs prensas de ferro moldaram o metal quente!\nForam cunhadas *${cunhadas} Moedas com a efígie do Dragão da Ira*!`);
        }
};
