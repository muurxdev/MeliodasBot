/**
 * Comando .bindecode — Converte sequência de bytes binários de volta para texto
 */
module.exports = {
    name: "bindecode",
    aliases: ["bin2texto"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Converte sequência de bytes binários de volta para texto",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.bindecode <01001000 01100101...>`');
            const bytes = t.split(/\s+/).filter(b => /^[01]{1,8}$/.test(b));
            if (bytes.length === 0) return reply('❌ Nenhum byte binário válido detectado.');
            const buf = Buffer.from(bytes.map(b => parseInt(b, 2)));
            return reply(`🔤 *TEXTO DECODIFICADO:*\n\n${buf.toString('utf8')}`);
        }
};
