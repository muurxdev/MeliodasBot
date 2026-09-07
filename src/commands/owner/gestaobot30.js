/**
 * Comando .gestaobot30 — Controle operacional e gestão de subdonos #30: .gestaobot30
 * Categoria: owner | Subcategoria: Donos & Aluguel
 */

module.exports = {
    name: "gestaobot30",
    aliases: ["gbot30","gbot-30"],
    category: "owner",
    subcategory: "Donos & Aluguel",
    description: "Controle operacional e gestão de subdonos #30: .gestaobot30",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👑 *GESTÃO DE DONOS & SUBDONOS*\n\nSupervisão de servidores, licenças ativas, faturamento e segurança global.\n\n▫️ *Identificador:* #30\n▫️ *Categoria:* OWNER / Donos & Aluguel\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.gestaobot30` para consultar métricas e dados.";
        return reply(doc);
    }
};
