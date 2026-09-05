/**
 * Comando .infinityspell — Canaliza a benção de magia infinita de Merlin: .infinityspell
 */
module.exports = {
    name: "infinityspell",
    aliases: [],
    category: "rpg",
    subcategory: "Magia",
    description: "Canaliza a benção de magia infinita de Merlin: .infinityspell",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply(`🔮 *INFINITY (Magia Infinita de Merlin)*\n\n▫️ *Usuária:* Merlin, a Filha de Belialuin\n▫️ *Efeito:* Uma vez conjurado, qualquer feitiço dura para sempre até ser cancelado pela própria maga.\n▫️ O gelo não derrete, o fogo não se apaga, o tempo para os aliados permanece congelado!`);
        }
};
