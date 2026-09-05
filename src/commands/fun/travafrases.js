/**
 * Comando .travafrases — Envia um trava-línguas clássico para testar a dicção: .travafrases
 */
module.exports = {
    name: "travafrases",
    aliases: [],
    category: "fun",
    subcategory: "Desafios",
    description: "Envia um trava-línguas clássico para testar a dicção: .travafrases",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const travas = [
                "O rato roeu a roupa do rei de Roma.",
                "Três pratos de trigo para três tigres tristes.",
                "Sabia que o sabiá sabia assobiar?",
                "O doce perguntou pro doce qual é o doce mais doce."
            ];
            return reply(`👅 *TRAVA-LÍNGUAS*\n\nTente falar rápido 3 vezes sem gaguejar:\n👉 *${travas[Math.floor(Math.random() * travas.length)]}*`);
        }
};
