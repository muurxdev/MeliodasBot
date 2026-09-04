/**
 * Comando .maiuscula — Converte o texto para MAIÚSCULAS
 */
module.exports = {
    name: "maiuscula",
    aliases: ["upper","caixaalta"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte o texto para MAIÚSCULAS",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔠 Uso: `.maiuscula <texto>`'); return reply(t.toUpperCase()); }
};
