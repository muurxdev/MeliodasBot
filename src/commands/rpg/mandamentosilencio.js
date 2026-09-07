/**
 * Comando .mandamentosilencio — Testa o Mandamento do Silêncio (Monspeet): .mandamentosilencio
 */
module.exports = {
    name: "mandamentosilencio",
    aliases: ["mandamentosilencio-cmd","cmd-mandamentosilencio"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento do Silêncio (Monspeet): .mandamentosilencio",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🤫 *MANDAMENTO DO SILÊNCIO (Monspeet)*\n\n▫️ Aquele que expressar sentimentos reprimidos ou falar em vão tem a sua voz selada e seus pulmões asfixiados pelas trevas.`);
        }
};
