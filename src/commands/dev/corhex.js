/**
 * Comando .corhex — Gera uma cor hexadecimal aleatória
 */
module.exports = {
    name: "corhex",
    aliases: ["corrandom","randomcolor","hexcor"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Gera uma cor hexadecimal aleatória",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const hex='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0').toUpperCase(); const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return reply('🎨 *COR ALEATÓRIA*\n\n🔖 HEX: `'+hex+'`\n🔴 RGB: `rgb('+r+', '+g+', '+b+')`'); }
};
