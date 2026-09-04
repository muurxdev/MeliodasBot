/**
 * Comando .rot13 — Cifra/decifra texto em ROT13
 */
module.exports = {
    name: "rot13",
    aliases: ["cifrarot","rot"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Cifra/decifra texto em ROT13",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔐 Uso: `.rot13 <texto>`'); return reply(t.replace(/[a-z]/gi,c=>String.fromCharCode((c.toLowerCase()<='m'?13:-13)+c.charCodeAt(0)))); }
};
