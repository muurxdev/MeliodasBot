/**
 * Comando .espadaquebrada — Empunha o punho da Espada Quebrada do Dragão: .espadaquebrada
 */
module.exports = {
    name: "espadaquebrada",
    aliases: [],
    category: "rpg",
    subcategory: "Equipamento",
    description: "Empunha o punho da Espada Quebrada do Dragão: .espadaquebrada",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🐉 *EMPUNHADURA DO DRAGÃO*\n\nVocê empunha a lâmina partida que sela o Caixão das Trevas Eternas!\n▫️ *Portador:* Meliodas\n▫️ *Efeito:* Intimidação draconiana! Monstros de nível baixo recuam em pavor.\n▫️ *Full Counter:* Pronto para refletir qualquer investida mágica direta!`);
        }
};
