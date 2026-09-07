/**
 * Comando .aposta30 — Mecanismo de jogos de sorte e cassino #30: .aposta30
 * Categoria: economy | Subcategoria: Cassino & Apostas
 */

module.exports = {
    name: "aposta30",
    aliases: ["apos30","apos-30"],
    category: "economy",
    subcategory: "Cassino & Apostas",
    description: "Mecanismo de jogos de sorte e cassino #30: .aposta30",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎰 *CASSINO & APOSTAS REAL*\n\nDesafie a sorte nas mesas de apostas com multiplicadores dinâmicos.\n\n▫️ *Identificador:* #30\n▫️ *Categoria:* ECONOMY / Cassino & Apostas\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.aposta30` para consultar métricas e dados.";
        return reply(doc);
    }
};
