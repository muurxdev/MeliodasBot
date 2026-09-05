/**
 * Comando .genpassstrong — Gera senha forte aleatória: .genpassstrong [tamanho=16]
 */
module.exports = {
    name: "genpassstrong",
    aliases: [],
    category: "dev",
    subcategory: "Segurança",
    description: "Gera senha forte aleatória: .genpassstrong [tamanho=16]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const len = Math.min(64, Math.max(8, parseInt(args[0]) || 16));
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
            let pass = "";
            for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random() * chars.length)];
            return reply(`🔑 *Senha Forte Gerada (${len} chars):*\n\`${pass}\``);
        }
};
