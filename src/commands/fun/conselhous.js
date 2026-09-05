/**
 * Comando .conselhous — Receba um conselho sábio (ou irônico) para a vida: .conselhous
 */
module.exports = {
    name: "conselhous",
    aliases: [],
    category: "fun",
    subcategory: "Oráculo",
    description: "Receba um conselho sábio (ou irônico) para a vida: .conselhous",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const c = [
                "Não tome decisões permanentes baseado em emoções temporárias.",
                "Se nada der certo, vá dormir. O Hawk cuida das sobras amanhã!",
                "Beba água e lembre-se de que até Escanor precisa do sol para brilhar.",
                "Não guarde rancor, guarde dinheiro para cerveja de Bernia!"
            ];
            return reply(`📜 *CONSELHO DA TAVERNA*\n\n"${c[Math.floor(Math.random() * c.length)]}"`);
        }
};
