/**
 * Comando .avisogrupo — Formata e dispara um comunicado solene no grupo: .avisogrupo <mensagem>
 */
module.exports = {
    name: "avisogrupo",
    aliases: [],
    category: "admin",
    subcategory: "Avisos",
    description: "Formata e dispara um comunicado solene no grupo: .avisogrupo <mensagem>",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const m = args.join(" ");
            if (!m) return reply("📢 Uso: `.avisogrupo <mensagem>`");
            return reply(`🛡️📜 *COMUNICADO OFICIAL DA ADMINISTRAÇÃO*\n\n"Atenção a todos os membros de Britannia:\n\n${m}\n\n— *Ordem dos Cavaleiros Sagrados*"`);
        }
};
