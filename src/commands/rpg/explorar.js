/**
 * Comando .explorar
 * Expedição em biomas desconhecidos para coleta de gemas e artefatos
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

const BIOMAS = [
    { name: "Floresta dos Sonhos Brancos", drop: "🍃 Erva de Fada", xp: 180, coins: 120 },
    { name: "Ruínas Antigas de Danafor", drop: "🏛️ Fragmento de Relíquia", xp: 320, coins: 210 },
    { name: "Vulcão de Cinzas Negras", drop: "🌋 Pedra Ígnea", xp: 480, coins: 340 },
    { name: "Vale dos Mortos Silenciosos", drop: "💎 Diamante Sombrio", xp: 750, coins: 500 }
];

module.exports = {
    name: "explorar",
    aliases: ["bioma", "expedicao", "viajante", "desbravar"],
    category: "rpg",
    description: "Explore biomas místicos de Britannia em busca de itens raros e recursos",
    cooldownMs: 20000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const bioma = BIOMAS[Math.floor(Math.random() * BIOMAS.length)];

        user.xp = (user.xp || 0) + bioma.xp;
        user.coins = (user.coins || 0) + bioma.coins;
        if (!Array.isArray(user.inventario)) user.inventario = [];
        const limiteMochila = user.mochila || 20;
        let itemAdicionado = false;
        if (user.inventario.length < limiteMochila) {
            user.inventario.push(bioma.drop);
            itemAdicionado = true;
        }
        user.inventory = user.inventario;

        dataService.saveUser(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    🧭 *EXPEDIÇÃO CONCLUÍDA!* 🧭   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🌲 *Bioma Explorado:* ${bioma.name}\n`;
        doc += `✨ *Você explorou as terras selvagens e retornou com espólios!*\n\n`;
        doc += `🎁 *Item Encontrado:* ${bioma.drop}\n`;
        doc += `⭐ *XP Conquistado:* +${bioma.xp} XP\n`;
        doc += `💰 *Moedas Coletadas:* +${bioma.coins} Coins\n\n`;
        doc += `🎒 _Item armazenado na sua mochila! Verifique com \`.mochila\`._`;

        return reply(doc.trim());
    }
};

