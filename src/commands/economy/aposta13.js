/**
 * Comando .aposta13 — Mecanismo de jogos de sorte e cassino #13: .aposta13
 * Categoria: economy | Subcategoria: Cassino & Apostas
 */

module.exports = {
    name: "aposta13",
    aliases: ["apos13","apos-13"],
    category: "economy",
    subcategory: "Cassino & Apostas",
    description: "Mecanismo de jogos de sorte e cassino #13: .aposta13",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎰 *CASSINO & APOSTAS REAL*\n\nDesafie a sorte nas mesas de apostas com multiplicadores dinâmicos.\n\n▫️ *Identificador:* #13\n▫️ *Categoria:* ECONOMY / Cassino & Apostas\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.aposta13` para consultar métricas e dados.";
        return reply(doc);
    }
};
