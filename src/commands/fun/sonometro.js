/**
 * Comando .sonometro — Medidor de nível de sono
 */
module.exports = {
    name: "sonometro",
    aliases: ["sono","sonolencia"],
    category: "fun",
    subcategory: "Diversão",
    description: "Medidor de nível de sono",
    cooldownMs: 1500,
    execute: async ({ args, reply, sender, mentionedJid }) => {
    const alvo = (mentionedJid && mentionedJid[0]) || sender || 'alguem';
    const nome = '@' + String(alvo).split('@')[0];
    const seed = [...(String(alvo) + new Date().toDateString() + "sonometro")].reduce((a,c)=>a+c.charCodeAt(0),0);
    const pct = seed % 101;
    const cheios = Math.round(pct/10);
    const barra = '█'.repeat(cheios) + '░'.repeat(10-cheios);
    return reply("💤 *Nível de sono* de " + nome + '\n\n' + barra + ' *' + pct + '%*', [alvo]);
  }
};
