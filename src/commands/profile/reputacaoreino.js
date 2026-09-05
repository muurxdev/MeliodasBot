/**
 * Comando .reputacaoreino — Status de reputação nos cinco grandes reinos: .reputacaoreino
 */
module.exports = {
    name: "reputacaoreino",
    aliases: [],
    category: "profile",
    subcategory: "Status",
    description: "Status de reputação nos cinco grandes reinos: .reputacaoreino",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🌍 *REPUTAÇÃO NOS REINOS*\n\n▫️ Liones: 🟢 Honrado (Amigável)\n▫️ Camelot: 🟢 Respeitado\n▫️ Floresta das Fadas: 🟢 Bem-vindo\n▫️ Megadozer: 🟡 Neutro\n▫️ Reino Demoníaco: 🔴 Hostil (Cuidado!)");
        }
};
