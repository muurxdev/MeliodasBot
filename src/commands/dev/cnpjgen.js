/**
 * Comando .cnpjgen — Gera um CNPJ válido (apenas para testes de sistema)
 */
module.exports = {
    name: "cnpjgen",
    aliases: ["geradorcnpj","gerarcnpj"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Gera um CNPJ válido (apenas para testes de sistema)",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const rnd=()=>Math.floor(Math.random()*9); const n=Array.from({length:12},rnd); const calc=(arr)=>{const p=arr.length===12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2]; let s=0; for(let i=0;i<arr.length;i++) s+=arr[i]*p[i]; const r=s%11; return r<2?0:11-r;}; n.push(calc(n)); n.push(calc(n)); const s=n.join(''); const fmt=s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'); return reply('🏢 *CNPJ gerado (teste):* `'+fmt+'`\n⚠️ _Apenas para testes de sistema._'); }
};
