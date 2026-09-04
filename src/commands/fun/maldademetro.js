/**
 * Comando .maldademetro — Medidor de nível de maldade
 */
module.exports = {
    name: "maldademetro",
    aliases: ["maldade","vilao"],
    category: "fun",
    subcategory: "Diversão",
    description: "Medidor de nível de maldade",
    cooldownMs: 1500,
    execute: async ({ args, reply, sender, mentionedJid }) => {
    const alvo = (mentionedJid && mentionedJid[0]) || sender || 'alguem';
    const nome = '@' + String(alvo).split('@')[0];
    const seed = [...(String(alvo) + new Date().toDateString() + "maldademetro")].reduce((a,c)=>a+c.charCodeAt(0),0);
    const pct = seed % 101;
    const cheios = Math.round(pct/10);
    const barra = '█'.repeat(cheios) + '░'.repeat(10-cheios);
    return reply("😈 *Nível de maldade* de " + nome + '\n\n' + barra + ' *' + pct + '%*', [alvo]);
  }
};
