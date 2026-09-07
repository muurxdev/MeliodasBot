/**
 * Comando .aposta27 — Mecanismo de jogos de sorte e cassino #27: .aposta27
 * Categoria: economy | Subcategoria: Cassino & Apostas
 */

module.exports = {
    name: "aposta27",
    aliases: ["apos27","apos-27"],
    category: "economy",
    subcategory: "Cassino & Apostas",
    description: "Mecanismo de jogos de sorte e cassino #27: .aposta27",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎰 *CASSINO & APOSTAS REAL*\n\nDesafie a sorte nas mesas de apostas com multiplicadores dinâmicos.\n\n▫️ *Identificador:* #27\n▫️ *Categoria:* ECONOMY / Cassino & Apostas\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.aposta27` para consultar métricas e dados.";
        return reply(doc);
    }
};
