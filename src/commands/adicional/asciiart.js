/**
 * Comando .asciiart / .ascii
 * Transforma textos em banners estilizados em ASCII
 */

const FONT_BLOCKS = {
    'A': [' ▄▀█ ', '█▀█ ', '▀ ▀ '],
    'B': ['█▀▄ ', '█▀▄ ', '▀▀  '],
    'C': ['█▀▀ ', '█▄▄ ', ' ▀▀ '],
    'D': ['█▀▄ ', '█ █ ', '▀▀  '],
    'E': ['█▀▀ ', '██▄ ', '▀▀▀ '],
    'F': ['█▀▀ ', '█▀  ', '▀   '],
    'G': ['█▀▀█', '█ ▄█', ' ▀▀▀'],
    'H': ['█ █ ', '█▀█ ', '▀ ▀ '],
    'I': ['█ ', '█ ', '▀ '],
    'J': ['  █ ', '▄ █ ', ' ▀  '],
    'K': ['█▄▀ ', '█ █ ', '▀ ▀ '],
    'L': ['█   ', '█▄▄ ', '▀▀▀ '],
    'M': ['█▀▄▀█', '█ ▀ █', '▀   ▀'],
    'N': ['█▄ █', '█ ▀█', '▀  ▀'],
    'O': ['█▀█ ', '█▄█ ', ' ▀▀ '],
    'P': ['█▀█ ', '█▀▀ ', '▀   '],
    'Q': ['█▀█ ', '█▄█▄', ' ▀▀ '],
    'R': ['█▀█ ', '█▀▄ ', '▀ ▀ '],
    'S': ['█▀▀ ', '▄▄█ ', '▀▀▀ '],
    'T': ['▀█▀ ', ' █  ', ' ▀  '],
    'U': ['█ █ ', '█▄█ ', ' ▀▀ '],
    'V': ['█ █ ', '▀▄▀ ', ' ▀  '],
    'W': ['█ █ █', '▀▄▀▄▀', ' ▀ ▀ '],
    'X': ['▀▄▀ ', '█ █ ', '▀ ▀ '],
    'Y': ['█▄█ ', ' █  ', ' ▀  '],
    'Z': ['▀▀█ ', '▄▄█ ', '▀▀▀ '],
    ' ': ['  ', '  ', '  '],
    '0': ['█▀█', '█▄█', ' ▀▀'],
    '1': [' █ ', ' █ ', ' ▀ '],
    '2': ['▀▀█', '█▄▄', '▀▀▀'],
    '3': ['▀▀█', '▄▄█', '▀▀▀'],
    '4': ['█ █', '█▀█', '  ▀'],
    '5': ['█▀▀', '▀▀█', '▀▀▀'],
    '6': ['█▀▀', '█▄█', '▀▀▀'],
    '7': ['▀▀█', '  █', '  ▀'],
    '8': ['█▀█', '█▀█', '▀▀▀'],
    '9': ['█▀█', '▀▀█', '▀▀▀'],
    '!': ['█', '█', '▀'],
    '?': ['▀█', ' █', ' ▀']
};

module.exports = {
    name: 'bannerascii',
    aliases: ['textobanner', 'asciiplus', 'letrabanner'],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Converte palavras em arte e banner estilizado em ASCII',
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
        const text = args.join(' ').trim().toUpperCase();
        if (!text) {
            return reply(`🎨 *Gerador de Arte ASCII*\n\nUse: \`${prefix}bannerascii <palavra>\`\n\n💡 *Exemplo:* \`${prefix}bannerascii MELIODAS\``);
        }

        if (text.length > 15) {
            return reply('⚠️ Para melhor visualização no celular, envie no máximo 15 caracteres.');
        }

        const lines = ['', '', ''];
        for (const char of text) {
            const block = FONT_BLOCKS[char] || [' ', ' ', ' '];
            lines[0] += block[0] + ' ';
            lines[1] += block[1] + ' ';
            lines[2] += block[2] + ' ';
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║      🎨 *ARTE ASCII BANNER* 🎨     ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += '```\n' + lines.join('\n') + '\n```\n\n';
        doc += `✨ *Texto:* _${text}_`;

        return reply(doc.trim());
    }
};