/**
 * Comando .gestaobot26 — Controle operacional e gestão de subdonos #26: .gestaobot26
 * Categoria: owner | Subcategoria: Donos & Aluguel
 */

module.exports = {
    name: "gestaobot26",
    aliases: ["gbot26","gbot-26"],
    category: "owner",
    subcategory: "Donos & Aluguel",
    description: "Controle operacional e gestão de subdonos #26: .gestaobot26",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👑 *GESTÃO DE DONOS & SUBDONOS*\n\nSupervisão de servidores, licenças ativas, faturamento e segurança global.\n\n▫️ *Identificador:* #26\n▫️ *Categoria:* OWNER / Donos & Aluguel\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.gestaobot26` para consultar métricas e dados.";
        return reply(doc);
    }
};
