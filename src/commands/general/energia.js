/**
 * Comando .energia — Converte unidades de energia (j, kj, cal, kcal, wh, kwh)
 */
module.exports = {
    name: "energia",
    aliases: ["energyconv","energiaconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte unidades de energia (j, kj, cal, kcal, wh, kwh)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={j:1,kj:1000,cal:4.184,kcal:4184,wh:3600,kwh:3.6e6}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('⚡ *Energia* — `.energia <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`⚡ *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(4)}* ${ate}`);} let d=`⚡ *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(4)}* ${k}\n`;} return reply(d.trim()); }
};
