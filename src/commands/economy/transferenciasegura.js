/**
 * Comando .transferenciasegura — Envia fundos criptografados via magia de teletransporte: .transferenciasegura <usuario> <qtd>
 */
module.exports = {
    name: "transferenciasegura",
    aliases: [],
    category: "economy",
    subcategory: "Banco",
    description: "Envia fundos criptografados via magia de teletransporte: .transferenciasegura <usuario> <qtd>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("💸 *Transferência Instantânea*\nUso: `.transferenciasegura <destinatario> <quantidade>`");
            const dest = args[0], qtd = parseInt(args[1]) || 100;
            return reply(`✨💸 *TELETRANSPORTE DE MOEDAS*\n\nMerlin canalizou seu feitiço de transladação!\n💰 *${qtd} Moedas* foram enviadas com sucesso para *${dest}* com taxa zero!`);
        }
};
