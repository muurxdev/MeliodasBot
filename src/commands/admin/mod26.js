/**
 * Comando .mod26 — Ferramenta de segurança e moderação de grupo #26: .mod26
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod26",
    aliases: [],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #26: .mod26",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #26\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod26` para consultar métricas e dados.";
        return reply(doc);
    }
};
