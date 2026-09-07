/**
 * Comando .gestaobot6 — Controle operacional e gestão de subdonos #6: .gestaobot6
 * Categoria: owner | Subcategoria: Donos & Aluguel
 */

module.exports = {
    name: "gestaobot6",
    aliases: ["gbot6","gbot-6"],
    category: "owner",
    subcategory: "Donos & Aluguel",
    description: "Controle operacional e gestão de subdonos #6: .gestaobot6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👑 *GESTÃO DE DONOS & SUBDONOS*\n\nSupervisão de servidores, licenças ativas, faturamento e segurança global.\n\n▫️ *Identificador:* #6\n▫️ *Categoria:* OWNER / Donos & Aluguel\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.gestaobot6` para consultar métricas e dados.";
        return reply(doc);
    }
};
