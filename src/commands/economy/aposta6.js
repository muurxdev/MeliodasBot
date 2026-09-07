/**
 * Comando .aposta6 — Mecanismo de jogos de sorte e cassino #6: .aposta6
 * Categoria: economy | Subcategoria: Cassino & Apostas
 */

module.exports = {
    name: "aposta6",
    aliases: ["apos6","apos-6"],
    category: "economy",
    subcategory: "Cassino & Apostas",
    description: "Mecanismo de jogos de sorte e cassino #6: .aposta6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎰 *CASSINO & APOSTAS REAL*\n\nDesafie a sorte nas mesas de apostas com multiplicadores dinâmicos.\n\n▫️ *Identificador:* #6\n▫️ *Categoria:* ECONOMY / Cassino & Apostas\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.aposta6` para consultar métricas e dados.";
        return reply(doc);
    }
};
