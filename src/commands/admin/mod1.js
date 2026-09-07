/**
 * Comando .mod1 — Ferramenta de segurança e moderação de grupo #1: .mod1
 * Categoria: admin | Subcategoria: Moderação & Segurança
 */

module.exports = {
    name: "mod1",
    aliases: ["modgrp1","modgrp-1"],
    category: "admin",
    subcategory: "Moderação & Segurança",
    description: "Ferramenta de segurança e moderação de grupo #1: .mod1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *MODERAÇÃO DE GRUPO*\n\nRecurso de proteção ativa para integridade e saúde da comunidade.\n\n▫️ *Identificador:* #1\n▫️ *Categoria:* ADMIN / Moderação & Segurança\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.mod1` para consultar métricas e dados.";
        return reply(doc);
    }
};
