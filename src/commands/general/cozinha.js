/**
 * Comando .cozinha — Converte medidas de cozinha (ml, l, xicara, colhersopa, colhercha)
 */
module.exports = {
    name: "cozinha",
    aliases: ["medidacozinha","receitaconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte medidas de cozinha (ml, l, xicara, colhersopa, colhercha)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={ml:1,l:1000,xicara:240,colhersopa:15,colhercha:5}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('🍳 *Cozinha* — `.cozinha <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`🍳 *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(2)}* ${ate}`);} let d=`🍳 *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(2)}* ${k}\n`;} return reply(d.trim()); }
};
