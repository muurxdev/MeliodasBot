/**
 * Comando .tempoconv — Converte unidades de tempo (s, min, h, dia, semana, mes, ano)
 */
module.exports = {
    name: "tempoconv",
    aliases: ["tempounit","timeconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte unidades de tempo (s, min, h, dia, semana, mes, ano)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={s:1,min:60,h:3600,dia:86400,semana:604800,mes:2592000,ano:31536000}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('⏱️ *Tempo* — `.tempoconv <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`⏱️ *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(4)}* ${ate}`);} let d=`⏱️ *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(4)}* ${k}\n`;} return reply(d.trim()); }
};
