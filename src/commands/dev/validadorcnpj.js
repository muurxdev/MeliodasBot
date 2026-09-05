/**
 * Comando .validadorcnpj — Valida os dígitos verificadores de um CNPJ: .validadorcnpj <cnpj>
 */
module.exports = {
    name: "validadorcnpj",
    aliases: [],
    category: "dev",
    subcategory: "Validação",
    description: "Valida os dígitos verificadores de um CNPJ: .validadorcnpj <cnpj>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const cnpj = (args[0] || "").replace(/\D/g, "");
            if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return reply("❌ CNPJ com formato inválido (deve ter 14 dígitos).");
            const calc = (slice, pesos) => {
                let soma = 0;
                for (let i = 0; i < slice.length; i++) soma += parseInt(slice[i]) * pesos[i];
                const rest = soma % 11;
                return rest < 2 ? 0 : 11 - rest;
            };
            const d1 = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
            const d2 = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
            const valido = d1 === parseInt(cnpj[12]) && d2 === parseInt(cnpj[13]);
            return reply(valido ? `✅ CNPJ *${cnpj}* possui DÍGITOS VÁLIDOS!` : `❌ CNPJ *${cnpj}* com dígitos verificadores INVÁLIDOS.`);
        }
};
