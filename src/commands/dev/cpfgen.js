/**
 * Comando .cpfgen — Gera um CPF válido (apenas para testes de sistema)
 */
module.exports = {
    name: "cpfgen",
    aliases: ["geradorcpf","gerarcpf"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Gera um CPF válido (apenas para testes de sistema)",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const rnd=()=>Math.floor(Math.random()*9); const n=Array.from({length:9},rnd); const dv=(arr)=>{let s=0; for(let i=0;i<arr.length;i++) s+=arr[i]*(arr.length+1-i); const r=(s*10)%11; return r===10?0:r;}; n.push(dv(n)); n.push(dv(n)); const s=n.join(''); const fmt=s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'); return reply('🪪 *CPF gerado (teste):* `'+fmt+'`\n⚠️ _Apenas para testes de sistema._'); }
};
