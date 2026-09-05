/**
 * Comando .isleapyear — Verifica se um ano é bissexto: .isleapyear <ano>
 */
module.exports = {
    name: "isleapyear",
    aliases: [],
    category: "dev",
    subcategory: "Data",
    description: "Verifica se um ano é bissexto: .isleapyear <ano>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const ano = parseInt(args[0]) || new Date().getFullYear();
            const isLeap = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
            return reply(isLeap ? `✅ O ano *${ano}* É bissexto (366 dias)!` : `❌ O ano *${ano}* NÃO é bissexto (365 dias).`);
        }
};
