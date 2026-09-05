/**
 * Comando .genpasspin — Gera PIN numérico seguro: .genpasspin [digitos=6]
 */
module.exports = {
    name: "genpasspin",
    aliases: [],
    category: "dev",
    subcategory: "Segurança",
    description: "Gera PIN numérico seguro: .genpasspin [digitos=6]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const len = Math.min(12, Math.max(4, parseInt(args[0]) || 6));
            let pin = "";
            for (let i = 0; i < len; i++) pin += Math.floor(Math.random() * 10).toString();
            return reply(`🔢 *PIN Seguro Gerado:*\n\`${pin}\``);
        }
};
