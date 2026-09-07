/**
 * Comando .gestaobot14 — Controle operacional e gestão de subdonos #14: .gestaobot14
 * Categoria: owner | Subcategoria: Donos & Aluguel
 */

module.exports = {
    name: "gestaobot14",
    aliases: ["gbot14","gbot-14"],
    category: "owner",
    subcategory: "Donos & Aluguel",
    description: "Controle operacional e gestão de subdonos #14: .gestaobot14",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👑 *GESTÃO DE DONOS & SUBDONOS*\n\nSupervisão de servidores, licenças ativas, faturamento e segurança global.\n\n▫️ *Identificador:* #14\n▫️ *Categoria:* OWNER / Donos & Aluguel\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.gestaobot14` para consultar métricas e dados.";
        return reply(doc);
    }
};
