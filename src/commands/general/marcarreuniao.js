/**
 * Comando .marcarreuniao — Convoca uma reunião de conselho da guilda no grupo: .marcarreuniao
 */
module.exports = {
    name: "marcarreuniao",
    aliases: [],
    category: "general",
    subcategory: "Grupo",
    description: "Convoca uma reunião de conselho da guilda no grupo: .marcarreuniao",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply("📢 *CONVOCAÇÃO DO CONSELHO DA GUILDA*\n\nTodos os membros são convocados à mesa principal do Boar Hat para alinhamento estratégico!");
        }
};
