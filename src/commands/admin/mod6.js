/**
 * Comando .mod6 — Ferramenta de segurança e moderação de grupo #6: .mod6
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod6",
    aliases: [],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #6: .mod6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #6\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod6` para consultar métricas e dados.";
        return reply(doc);
    }
};
