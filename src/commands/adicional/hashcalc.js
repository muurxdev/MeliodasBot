/**
 * Comando .hashcalc / .hash
 * Calcula checksums e hashes criptográficos (MD5, SHA1, SHA256, SHA512)
 */

const crypto = require('crypto');

module.exports = {
    name: 'hashcalc',
    aliases: ['gerarhash', 'calchash', 'checksumgerar'],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Calcula hashes criptográficos (MD5, SHA1, SHA256, SHA512) de um texto',
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
        const text = args.join(' ').trim();
        if (!text) {
            return reply(`🔐 *Calculadora de Hashes Criptográficos*\n\nUse: \`${prefix}hashcalc <texto ou senha>\`\n\n💡 *Exemplo:* \`${prefix}hashcalc MeliodasBot2026\``);
        }

        const md5 = crypto.createHash('md5').update(text).digest('hex');
        const sha1 = crypto.createHash('sha1').update(text).digest('hex');
        const sha256 = crypto.createHash('sha256').update(text).digest('hex');
        const sha512 = crypto.createHash('sha512').update(text).digest('hex');

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    🔐 *HASHES CRIPTOGRÁFICOS* 🔐    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📝 *Entrada:* \`${text.slice(0, 80)}\`\n\n`;
        doc += `╭━〔 🛡️ HASHES GERADOS 〕━⬣\n`;
        doc += `┃ 🔹 *MD5 (128-bit):*\n┃ \`${md5}\`\n\n`;
        doc += `┃ 🔹 *SHA-1 (160-bit):*\n┃ \`${sha1}\`\n\n`;
        doc += `┃ 🔹 *SHA-256 (256-bit):*\n┃ \`${sha256}\`\n\n`;
        doc += `┃ 🔹 *SHA-512 (512-bit):*\n┃ \`${sha512.slice(0, 64)}...\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`;
        doc += `✨ _Hashes calculados com motor criptográfico Node.js nativo._`;

        return reply(doc.trim());
    }
};