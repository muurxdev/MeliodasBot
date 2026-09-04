/**
 * Comando .massaconv — Converte unidades de massa (kg, g, mg, ton, lb, oz)
 */
module.exports = {
    name: "massaconv",
    aliases: ["pesoconv","massunit"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte unidades de massa (kg, g, mg, ton, lb, oz)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={kg:1000,g:1,mg:0.001,ton:1e6,lb:453.592,oz:28.3495}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('⚖️ *Massa* — `.massaconv <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`⚖️ *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(4)}* ${ate}`);} let d=`⚖️ *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(4)}* ${k}\n`;} return reply(d.trim()); }
};
