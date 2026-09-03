const logger = require('../../core/logger');

module.exports = {
    name: 'imc',
    aliases: ['bmim', 'pesoideal', 'imdice'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula o Índice de Massa Corporal e classifica o peso',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.imc <peso> <altura>`\n\n' +
                '📌 *Exemplo:* `.imc 70 1.75`\n\n' +
                '⚖️ *Peso em kg, altura em metros*'
            );
        }

        const parts = input.split(/\s+/);
        if (parts.length < 2) return reply('❌ Informe o peso e a altura.');

        const weight = parseFloat(parts[0].replace(',', '.'));
        const height = parseFloat(parts[1].replace(',', '.'));

        if (isNaN(weight) || weight <= 0) return reply('❌ Peso inválido.');
        if (isNaN(height) || height <= 0 || height > 3) return reply('❌ Altura inválida (use metros, ex: 1.75).');

        const imc = weight / (height * height);
        let classification, emoji, color;

        if (imc < 18.5) {
            classification = 'Magreza';
            emoji = '🔵';
            color = 'Abaixo do peso ideal';
        } else if (imc < 25) {
            classification = 'Normal';
            emoji = '🟢';
            color = 'Peso saudável';
        } else if (imc < 30) {
            classification = 'Sobrepeso';
            emoji = '🟡';
            color = 'Acima do peso ideal';
        } else if (imc < 35) {
            classification = 'Obesidade Grau I';
            emoji = '🟠';
            color = 'Obesidade moderada';
        } else if (imc < 40) {
            classification = 'Obesidade Grau II';
            emoji = '🔴';
            color = 'Obesidade severa';
        } else {
            classification = 'Obesidade Grau III';
            emoji = '⛔';
            color = 'Obesidade mórbida';
        }

        const idealMin = (18.5 * height * height).toFixed(1);
        const idealMax = (24.9 * height * height).toFixed(1);

        const doc = [
            `╔══════════════════════════════╗`,
            `║   ⚖️ *CALCULADORA DE IMC* ⚖️   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `⚖️ *Peso:* ${weight} kg`,
            `📏 *Altura:* ${height} m`,
            ``,
            `╭━〔 📊 RESULTADO 〕━⬣`,
            `┃ 🧮 *IMC:* **${imc.toFixed(1)}**`,
            `┃ ${emoji} *Classificação:* **${classification}**`,
            `┃ 📝 ${color}`,
            `╰━━━━━━━━━━━━━━━━━━⬣`,
            ``,
            `💡 *Peso ideal para sua altura:* ${idealMin} kg a ${idealMax} kg`
        ].join('\n');
        return reply(doc);
    }
};
