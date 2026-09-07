/**
 * Comando .gestaobot18 — Controle operacional e gestão de subdonos #18: .gestaobot18
 * Categoria: owner | Subcategoria: Donos & Aluguel
 */

module.exports = {
    name: "gestaobot18",
    aliases: ["gbot18","gbot-18"],
    category: "owner",
    subcategory: "Donos & Aluguel",
    description: "Controle operacional e gestão de subdonos #18: .gestaobot18",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👑 *GESTÃO DE DONOS & SUBDONOS*\n\nSupervisão de servidores, licenças ativas, faturamento e segurança global.\n\n▫️ *Identificador:* #18\n▫️ *Categoria:* OWNER / Donos & Aluguel\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.gestaobot18` para consultar métricas e dados.";
        return reply(doc);
    }
};
