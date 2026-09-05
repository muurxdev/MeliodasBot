/**
 * Comando .brasaoimperial — Exibe o brasão heráldico da sua linhagem: .brasaoimperial
 */
module.exports = {
    name: "brasaoimperial",
    aliases: [],
    category: "profile",
    subcategory: "Perfil",
    description: "Exibe o brasão heráldico da sua linhagem: .brasaoimperial",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🛡️⚜️ *BRASÃO HERÁLDICO DE LIONES*\n\n  ▲  \n /█\\   Emblema do Leão e Dragão entrelaçados em ouro.\n/███\\  Lema: \"Pela Paz de Britannia e Honra Eterna!\"\n ▀█▀  ");
        }
};
