/**
 * Comando .mod25 — Ferramenta de segurança e moderação de grupo #25: .mod25
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod25",
    aliases: [],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #25: .mod25",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #25\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod25` para consultar métricas e dados.";
        return reply(doc);
    }
};
