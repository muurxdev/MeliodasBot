/**
 * Comando .cacaniquelmagico — Puxa a alavanca do caça-níqueis temático: .cacaniquelmagico
 */
module.exports = {
    name: "cacaniquelmagico",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Puxa a alavanca do caça-níqueis temático: .cacaniquelmagico",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const slots = ["🔥", "⚡", "☀️", "🌙", "⚔️", "👑"];
            const s1 = slots[Math.floor(Math.random() * slots.length)];
            const s2 = slots[Math.floor(Math.random() * slots.length)];
            const s3 = slots[Math.floor(Math.random() * slots.length)];
            let res = `🎰 *CAÇA-NÍQUEIS DOS SETE PECADOS*\n\n[ ${s1} | ${s2} | ${s3} ]\n\n`;
            if (s1 === s2 && s2 === s3) {
                res += `💥 *SUPER COMBO!* Você acertou 3 símbolos iguais e levou 💰 *3.000 moedas*!`;
            } else if (s1 === s2 || s2 === s3) {
                res += `✨ Dupla sincronizada! Você ganhou 💰 *300 moedas*!`;
            } else {
                res += `Nada dessa vez... Puxe a alavanca novamente!`;
            }
            return reply(res);
        }
};
