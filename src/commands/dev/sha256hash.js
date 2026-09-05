/**
 * Comando .sha256hash — Calcula o hash criptográfico SHA-256 de um texto
 */
module.exports = {
    name: "sha256hash",
    aliases: ["hashsha256"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Calcula o hash criptográfico SHA-256 de um texto",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.sha256hash <texto>`');
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(t, 'utf8').digest('hex');
            return reply(`🔒 *HASH SHA-256*\n\n*Texto:* ${t}\n*Hash:* \`${hash}\``);
        }
};
