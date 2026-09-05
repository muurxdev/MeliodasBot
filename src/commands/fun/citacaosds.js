/**
 * Comando .citacaosds — Citação marcante de um dos personagens de Nanatsu: .citacaosds
 */
module.exports = {
    name: "citacaosds",
    aliases: [],
    category: "fun",
    subcategory: "Lore SDS",
    description: "Citação marcante de um dos personagens de Nanatsu: .citacaosds",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const citacoes = [
                { f: "Não importa o que aconteça, mesmo que você morra... Eu prometo que vou cumprir a promessa que fiz a você!", a: "Meliodas" },
                { f: "Um verdadeiro pecado... jamais pode ser apagado por ninguém!", a: "Ban" },
                { f: "E quem decidiu isso? Meu sol é quem decide!", a: "Escanor" },
                { f: "Mesmo que eu não tenha coração, as memórias que criei com vocês são reais.", a: "Gowther" }
            ];
            const c = citacoes[Math.floor(Math.random() * citacoes.length)];
            return reply(`🗡️ *CITAÇÃO DE NANATSU NO TAIZAI*\n\n"${c.f}"\n— *${c.a}*`);
        }
};
