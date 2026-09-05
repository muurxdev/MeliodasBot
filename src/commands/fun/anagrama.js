/**
 * Comando .anagrama — Gera um desafio de anagrama com palavras de anime para resolver
 */
module.exports = {
    name: "anagrama",
    aliases: ["desembaralhar"],
    category: "fun",
    subcategory: "Jogos",
    description: "Gera um desafio de anagrama com palavras de anime para resolver",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const words = [
                { word: 'MELIODAS', hint: 'Capitão dos Sete Pecados Capitais' },
                { word: 'ESCANOR', hint: 'O Pecado do Orgulho do Leão' },
                { word: 'ELIZABETH', hint: 'Princesa de Liones e Deusa' },
                { word: 'HAWK', hint: 'Capitão dos Comedores de Sobras' },
                { word: 'MERLIN', hint: 'A maior maga de toda Britânia' },
                { word: 'ZELDRIS', hint: 'Irmão mais novo do Capitão' },
                { word: 'CHASTIEFOL', hint: 'A Lança Espiritual do Rei das Fadas' },
                { word: 'LOSTVAYNE', hint: 'O Tesouro Sagrado de Meliodas' }
            ];
            const sel = words[Math.floor(Math.random() * words.length)];
            const scrambled = sel.word.split('').sort(() => Math.random() - 0.5).join('');
            return reply(`🧩 *DESAFIO DO ANAGRAMA*\n\nDesembaralhe a palavra:\n👉 \`${scrambled}\`\n\n💡 *Dica:* ${sel.hint}\n\n_Tente adivinhar quem ou o que é!_`);
        }
};
