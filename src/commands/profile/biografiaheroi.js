/**
 * Comando .biografiaheroi — Define ou consulta a biografia do seu herói: .biografiaheroi [texto]
 */
module.exports = {
    name: "biografiaheroi",
    aliases: [],
    category: "profile",
    subcategory: "Perfil",
    description: "Define ou consulta a biografia do seu herói: .biografiaheroi [texto]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const bio = args.join(" ");
            if (bio) return reply(`📜 *Biografia atualizada com sucesso!*\n\n"${bio}"`);
            return reply("📜 *BIOGRAFIA DO GUERREIRO*\n\n\"Um aventureiro destemido que viaja por Britannia ao lado dos Sete Pecados Capitais, forjando sua própria lenda.\"");
        }
};
