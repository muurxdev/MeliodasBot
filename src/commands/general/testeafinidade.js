/**
 * Comando .testeafinidade — Calcula sintonia mística com outro usuário: .testeafinidade [nome]
 */
module.exports = {
    name: "testeafinidade",
    aliases: [],
    category: "general",
    subcategory: "Social",
    description: "Calcula sintonia mística com outro usuário: .testeafinidade [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu par";
            const pct = Math.floor(Math.random() * 40) + 60;
            return reply(`🔮 *CRISTAL DE SINTONIA*\nSua sintonia mágica com *${alvo}* é de *${pct}%*! Almas conectadas pelo destino de Britannia.`);
        }
};
