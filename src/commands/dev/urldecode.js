/**
 * Comando .urldecode — Decodifica um texto de URL (percent-encoding)
 */
module.exports = {
    name: "urldecode",
    aliases: ["decodeurl","unescapeurl"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Decodifica um texto de URL (percent-encoding)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => { const t=(text||(args||[]).join(' ')).trim(); if(!t) return reply('🔗 Uso: `.urldecode <texto>`'); try { return reply(decodeURIComponent(t)); } catch(e){ return reply('❌ Texto de URL inválido.'); } }
};
