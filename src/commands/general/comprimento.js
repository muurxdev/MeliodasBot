/**
 * Comando .comprimento — Converte unidades de comprimento (m, km, cm, mm, mi, ft, in, yd)
 */
module.exports = {
    name: "comprimento",
    aliases: ["distanciaconv","lengthconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte unidades de comprimento (m, km, cm, mm, mi, ft, in, yd)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={m:1,km:1000,cm:0.01,mm:0.001,mi:1609.34,ft:0.3048,in:0.0254,yd:0.9144}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('📏 *Comprimento* — `.comprimento <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`📏 *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(4)}* ${ate}`);} let d=`📏 *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(4)}* ${k}\n`;} return reply(d.trim()); }
};
