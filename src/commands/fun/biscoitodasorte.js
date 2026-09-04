/**
 * Comando .biscoitodasorte — Abra um biscoito da sorte
 */
module.exports = {
    name: "biscoitodasorte",
    aliases: ["fortunecookie","sorte","biscoito"],
    category: "fun",
    subcategory: "Diversão",
    description: "Abra um biscoito da sorte",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const S=['Uma boa notícia chega antes do fim do dia.','Seu esforço será recompensado em breve.','Um reencontro inesperado te fará sorrir.','A resposta que procura está mais perto do que pensa.','Hoje é um bom dia para começar algo novo.']; const n=Math.floor(Math.random()*90)+1; return reply('🥠 *BISCOITO DA SORTE*\n\n"'+S[Math.floor(Math.random()*S.length)]+'"\n\n🔢 Número da sorte: *'+n+'*'); }
};
