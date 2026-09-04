/**
 * Comando .coragemetro — Medidor de nível de coragem
 */
module.exports = {
    name: "coragemetro",
    aliases: ["coragem","bravura"],
    category: "fun",
    subcategory: "Diversão",
    description: "Medidor de nível de coragem",
    cooldownMs: 1500,
    execute: async ({ args, reply, sender, mentionedJid }) => {
    const alvo = (mentionedJid && mentionedJid[0]) || sender || 'alguem';
    const nome = '@' + String(alvo).split('@')[0];
    const seed = [...(String(alvo) + new Date().toDateString() + "coragemetro")].reduce((a,c)=>a+c.charCodeAt(0),0);
    const pct = seed % 101;
    const cheios = Math.round(pct/10);
    const barra = '█'.repeat(cheios) + '░'.repeat(10-cheios);
    return reply("🦁 *Nível de coragem* de " + nome + '\n\n' + barra + ' *' + pct + '%*', [alvo]);
  }
};
