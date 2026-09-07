/**
 * Comando .codificar / .decodificar
 * Codificador e Decodificador multi-formato (Base64, Hex, Binário, Morse, URL, Rot13)
 */

const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

module.exports = {
    name: 'codificar',
    aliases: ['decodificar', 'cifrador', 'cifratexto'],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Codifica ou decodifica textos em Base64, Hex, Binário, Morse, URL ou Rot13',
    cooldownMs: 2000,
    execute: async ({ reply, args, command, prefix = '.' }) => {
        const isDecode = command.toLowerCase().startsWith('deco') || (args[0] || '').toLowerCase() === 'decode';
        const type = (isDecode && args[0]?.toLowerCase() === 'decode' ? args[1] : args[0])?.toLowerCase();
        const textArgs = isDecode && args[0]?.toLowerCase() === 'decode' ? args.slice(2) : args.slice(1);
        const text = textArgs.join(' ').trim();

        const validTypes = ['base64', 'hex', 'binario', 'bin', 'morse', 'url', 'rot13'];

        if (!type || !validTypes.includes(type) || !text) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔐 *CODIFICADOR / CIFRAS* 🔐  ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📌 *Uso:* ` + `\`${prefix}codificar <tipo> <texto>\` ou \`${prefix}decodificar <tipo> <texto>\`\n\n`;
            doc += `╭━〔 🧩 FORMATOS SUPORTADOS 〕━⬣\n`;
            doc += `┃ • *base64* ➔ Padrão RFC 4648\n`;
            doc += `┃ • *hex* ➔ Hexadecimal hexadecimal\n`;
            doc += `┃ • *binario* (ou *bin*) ➔ Código binário (8-bit)\n`;
            doc += `┃ • *morse* ➔ Código Morse Internacional\n`;
            doc += `┃ • *url* ➔ URL / Percent-encoding\n`;
            doc += `┃ • *rot13* ➔ Cifra de César Rot13\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 *Exemplo:* ` + `\`${prefix}codificar base64 Olá Mundo\`\n`;
            doc += `💡 *Exemplo Decode:* ` + `\`${prefix}decodificar base64 T2zDoSBNdW5kbw==\``;
            return reply(doc.trim());
        }

        let result = '';
        try {
            if (!isDecode) {
                switch (type) {
                    case 'base64':
                        result = Buffer.from(text, 'utf-8').toString('base64');
                        break;
                    case 'hex':
                        result = Buffer.from(text, 'utf-8').toString('hex');
                        break;
                    case 'binario':
                    case 'bin':
                        result = Array.from(Buffer.from(text, 'utf-8'))
                            .map(b => b.toString(2).padStart(8, '0'))
                            .join(' ');
                        break;
                    case 'morse':
                        result = text.toUpperCase().split('')
                            .map(char => MORSE_MAP[char] || char)
                            .join(' ');
                        break;
                    case 'url':
                        result = encodeURIComponent(text);
                        break;
                    case 'rot13':
                        result = text.replace(/[a-zA-Z]/g, c => {
                            const base = c <= 'Z' ? 65 : 97;
                            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
                        });
                        break;
                }
            } else {
                switch (type) {
                    case 'base64':
                        result = Buffer.from(text, 'base64').toString('utf-8');
                        break;
                    case 'hex':
                        result = Buffer.from(text.replace(/\s+/g, ''), 'hex').toString('utf-8');
                        break;
                    case 'binario':
                    case 'bin':
                        result = Buffer.from(text.trim().split(/\s+/).map(b => parseInt(b, 2))).toString('utf-8');
                        break;
                    case 'morse':
                        result = text.trim().split(/\s+/).map(code => REVERSE_MORSE[code] || (code === '/' ? ' ' : code)).join('');
                        break;
                    case 'url':
                        result = decodeURIComponent(text);
                        break;
                    case 'rot13':
                        result = text.replace(/[a-zA-Z]/g, c => {
                            const base = c <= 'Z' ? 65 : 97;
                            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
                        });
                        break;
                }
            }
        } catch (err) {
            return reply(`❌ *Erro ao processar ${isDecode ? 'decodificação' : 'codificação'}:* ${err.message}`);
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ${isDecode ? '🔓' : '🔐'} *RESULTADO (${type.toUpperCase()})*   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📌 *Modo:* ${isDecode ? 'Decodificado' : 'Codificado'}\n`;
        doc += `📝 *Original:* \`${text.slice(0, 100)}\`\n\n`;
        doc += '```\n' + result + '\n```\n';
        doc += `╰━━━━━━━━━━━━━━━━━━⬣`;
        return reply(doc.trim());
    }
};