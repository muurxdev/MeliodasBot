/**
 * Comando .aguadiaria — Quanto de água beber por dia: .aguadiaria <peso kg>
 */
module.exports = {
    name: "aguadiaria",
    aliases: ["agua","waterintake"],
    category: "general",
    subcategory: "Utilidades",
    description: "Quanto de água beber por dia: .aguadiaria <peso kg>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const p=parseFloat((args[0]||'').replace(',','.')); if(isNaN(p)) return reply('💧 Uso: `.aguadiaria <peso kg>`'); const ml=p*35; return reply(`💧 *ÁGUA POR DIA*\n\n⚖️ Peso: ${p}kg\n\n🥤 Recomendado: *${(ml/1000).toFixed(1)} L* (~${Math.round(ml)} ml)\n🥛 ~${Math.round(ml/240)} copos de 240ml`); }
};
