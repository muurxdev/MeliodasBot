/**
 * Comando .pressao — Converte unidades de pressão (pa, kpa, bar, atm, psi, mmhg)
 */
module.exports = {
    name: "pressao",
    aliases: ["pressureconv","pressaoconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte unidades de pressão (pa, kpa, bar, atm, psi, mmhg)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={pa:1,kpa:1000,bar:100000,atm:101325,psi:6894.76,mmhg:133.322}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('🌡️ *Pressão* — `.pressao <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`🌡️ *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(4)}* ${ate}`);} let d=`🌡️ *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(4)}* ${k}\n`;} return reply(d.trim()); }
};
