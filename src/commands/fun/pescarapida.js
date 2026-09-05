/**
 * Comando .pescarapida — Lança a vara de pesca em águas místicas para fisgar algo
 */
module.exports = {
    name: "pescarapida",
    aliases: ["jogopesca"],
    category: "fun",
    subcategory: "Jogos",
    description: "Lança a vara de pesca em águas místicas para fisgar algo",
    cooldownMs: 2000,
    execute: async ({ reply, sender }) => {
            const catches = [
                { name: '🐟 Tilápia Comum', val: 10 },
                { name: '🐠 Salmão Dourado', val: 50 },
                { name: '🐡 Baiacu Espinhoso', val: 25 },
                { name: '🦐 Camarão Gigante', val: 35 },
                { name: '🦑 Lula das Profundezas', val: 80 },
                { name: '🦈 Pequeno Tubarão Azul', val: 150 },
                { name: '👢 Bota Velha Furada', val: 0 },
                { name: '👑 Baú Afundado Misterioso', val: 300 }
            ];
            const p = catches[Math.floor(Math.random() * catches.length)];
            return reply(`🎣 *PESCARIA RÁPIDA*\n\nVocê puxou a linha e fisgou:\n👉 *${p.name}*!\n💰 *Valor estimado:* ${p.val} moedas.`);
        }
};
