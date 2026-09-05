/**
 * Comando .medalhasds — Lista suas medalhas de bravura da Guerra Santa: .medalhasds
 */
module.exports = {
    name: "medalhasds",
    aliases: [],
    category: "profile",
    subcategory: "Conquistas",
    description: "Lista suas medalhas de bravura da Guerra Santa: .medalhasds",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🎖️ *MEDALHAS DE HONRA*\n\n🥇 Ordem dos Cavaleiros Sagrados de Liones\n🥈 Ordem dos Guardiões da Floresta das Fadas\n🥉 Medalha de Mérito dos Sete Pecados Capitais\n\n*Concedidas pessoalmente pelo Rei Bartra Liones!*");
        }
};
