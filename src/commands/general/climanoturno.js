/**
 * Comando .climanoturno — Envia mensagem temática de boa noite para a guilda: .climanoturno
 */
module.exports = {
    name: "climanoturno",
    aliases: [],
    category: "general",
    subcategory: "Mensagens",
    description: "Envia mensagem temática de boa noite para a guilda: .climanoturno",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🌙✨ *O CELESTE NOTURNO DE LIONES*\n\nAs estrelas brilham sobre as colinas de Britannia...\nA taverna Boar Hat fecha suas janelas.\nTenham todos uma noite revigorante de descanso!");
        }
};
