/**
 * Comando .aposta32 — Mecanismo de jogos de sorte e cassino #32: .aposta32
 * Categoria: economy | Subcategoria: Cassino & Apostas
 */

module.exports = {
    name: "aposta32",
    aliases: ["apos32","apos-32"],
    category: "economy",
    subcategory: "Cassino & Apostas",
    description: "Mecanismo de jogos de sorte e cassino #32: .aposta32",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎰 *CASSINO & APOSTAS REAL*\n\nDesafie a sorte nas mesas de apostas com multiplicadores dinâmicos.\n\n▫️ *Identificador:* #32\n▫️ *Categoria:* ECONOMY / Cassino & Apostas\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.aposta32` para consultar métricas e dados.";
        return reply(doc);
    }
};
