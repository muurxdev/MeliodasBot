/**
 * Comando .leilaosds — Verifica o lote ativo no leilão do submundo: .leilaosds
 */
module.exports = {
    name: "leilaosds",
    aliases: [],
    category: "economy",
    subcategory: "Mercado",
    description: "Verifica o lote ativo no leilão do submundo: .leilaosds",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏷️ *LEILÃO SECRETO DO SUBMUNDO*\n\n▫️ *Lote Atual:* Frasco de Sangue de Wyvern Ancestral\n▫️ *Lance Atual:* 💰 4.200 Moedas de Ouro\n▫️ *Tempo Restante:* 15 minutos\n▫️ Use \`.darlaunce <valor>\` para cobrir a oferta!`);
        }
};
