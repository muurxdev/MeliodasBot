/**
 * Comando .mod13 — Ferramenta de segurança e moderação de grupo #13: .mod13
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod13",
    aliases: ["modgrp13","modgrp-13"],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #13: .mod13",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #13\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod13` para consultar métricas e dados.";
        return reply(doc);
    }
};
