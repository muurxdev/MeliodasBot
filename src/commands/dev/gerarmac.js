/**
 * Comando .gerarmac — Gera um endereço MAC de rede aleatório
 */
module.exports = {
    name: "gerarmac",
    aliases: ["macrandom"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um endereço MAC de rede aleatório",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
            const mac = `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
            return reply(`🌐 *ENDEREÇO MAC GERADO*\n\n\`${mac}\``);
        }
};
