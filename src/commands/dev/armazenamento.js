/**
 * Comando .armazenamento — Converte unidades de armazenamento (b, kb, mb, gb, tb) base 1024
 */
module.exports = {
    name: "armazenamento",
    aliases: ["bytesconv","dataunit"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Converte unidades de armazenamento (b, kb, mb, gb, tb) base 1024",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const U={b:1,kb:1024,mb:1048576,gb:1073741824,tb:1099511627776}; const v=parseFloat((args[0]||'').replace(',','.')); if(isNaN(v)) return reply('💾 *Armazenamento* — `.armazenamento <valor> <de> [para]`\nUnidades: '+Object.keys(U).join(', ')); const de=(args[1]||'').toLowerCase(); if(!(de in U)) return reply('❌ Unidade inválida: '+Object.keys(U).join(', ')); const base=v*U[de]; const ate=(args[2]||'').toLowerCase(); if(ate in U){const r=base/U[ate]; return reply(`💾 *${v} ${de}* = *${Number.isInteger(r)?r:r.toFixed(4)}* ${ate}`);} let d=`💾 *${v} ${de}* equivale a:\n\n`; for(const k of Object.keys(U)){if(k===de)continue;const r=base/U[k];d+=`• *${Number.isInteger(r)?r:r.toFixed(4)}* ${k}\n`;} return reply(d.trim()); }
};
