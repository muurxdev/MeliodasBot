/**
 * Comando .numerodasorte — Gera seus 6 números da sorte para apostas e jogos: .numerodasorte
 */
module.exports = {
    name: "numerodasorte",
    aliases: [],
    category: "fun",
    subcategory: "Sorte",
    description: "Gera seus 6 números da sorte para apostas e jogos: .numerodasorte",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const nums = [];
            while (nums.length < 6) {
                const n = Math.floor(Math.random() * 60) + 1;
                if (!nums.includes(n)) nums.push(n);
            }
            nums.sort((a, b) => a - b);
            return reply(`🍀 *NÚMEROS DA SORTE DE HOJE*\n\n👉 [ *${nums.join(" • ")}* ]\n\nQue a graça das deusas ilumine o seu bilhete!`);
        }
};
