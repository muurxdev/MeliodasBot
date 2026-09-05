/**
 * Comando .geraripv6 — Gera um endereço IPv6 válido aleatório
 */
module.exports = {
    name: "geraripv6",
    aliases: ["ipv6random"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um endereço IPv6 válido aleatório",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const hex = () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
            const ipv6 = `2001:0db8:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
            return reply(`🌐 *ENDEREÇO IPv6 GERADO*\n\n\`${ipv6}\``);
        }
};
