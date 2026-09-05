/**
 * Comando .piadaseca — Conta uma piada seca ou trocadilho rápido: .piadaseca
 */
module.exports = {
    name: "piadaseca",
    aliases: [],
    category: "fun",
    subcategory: "Humor",
    description: "Conta uma piada seca ou trocadilho rápido: .piadaseca",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const piadas = [
                "Por que o livro de matemática se suicidou? Porque tinha muitos problemas!",
                "Qual é o peixe que caiu do 10º andar? Aaaaah-tum!",
                "O que o pato falou para a pata? Vem Quá!",
                "Por que os químicos são ótimos em resolver problemas? Porque eles têm todas as soluções!"
            ];
            return reply(`😂 *PIADA DO DIA*\n\n${piadas[Math.floor(Math.random() * piadas.length)]}`);
        }
};
