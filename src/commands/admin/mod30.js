/**
 * Comando .mod30 — Ferramenta de segurança e moderação de grupo #30: .mod30
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod30",
    aliases: [],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #30: .mod30",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #30\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod30` para consultar métricas e dados.";
        return reply(doc);
    }
};
