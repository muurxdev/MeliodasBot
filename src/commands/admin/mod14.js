/**
 * Comando .mod14 — Ferramenta de segurança e moderação de grupo #14: .mod14
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod14",
    aliases: ["modgrp14","modgrp-14"],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #14: .mod14",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #14\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod14` para consultar métricas e dados.";
        return reply(doc);
    }
};
