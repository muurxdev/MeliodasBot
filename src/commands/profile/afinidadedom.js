/**
 * Comando .afinidadedom — Revela qual dom elemental rege a sua essência: .afinidadedom
 */
module.exports = {
    name: "afinidadedom",
    aliases: [],
    category: "profile",
    subcategory: "Status",
    description: "Revela qual dom elemental rege a sua essência: .afinidadedom",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const dons = [
                "🔥 Chama Solar Pura — Afinidade com Escanor e o calor da justiça.",
                "⚡ Relâmpago Cortante — Afinidade com Gilthunder e velocidade rápida.",
                "❄️ Neve Eterna — Afinidade com feitiços de congelamento e serenidade.",
                "🌿 Vida da Terra — Afinidade com Diane e manipulação mineral.",
                "🌑 Treva Abissal — Afinidade com Meliodas e regeneração sombria."
            ];
            return reply(`✨ *ELEMENTO DA SUA ALMA*\n\n${dons[Math.floor(Math.random() * dons.length)]}`);
        }
};
