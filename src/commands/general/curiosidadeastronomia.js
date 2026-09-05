/**
 * Comando .curiosidadeastronomia — Fato surpreendente sobre o universo e os astros: .curiosidadeastronomia
 */
module.exports = {
    name: "curiosidadeastronomia",
    aliases: [],
    category: "general",
    subcategory: "Curiosidades",
    description: "Fato surpreendente sobre o universo e os astros: .curiosidadeastronomia",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const fatos = [
                "Um dia em Vênus é mais longo do que um ano inteiro em Vênus!",
                "Existem mais árvores na Terra do que estrelas na Via Láctea (cerca de 3 trilhões contra 100 a 400 bilhões).",
                "O Sol representa cerca de 99.86% de toda a massa do Sistema Solar.",
                "Se dois pedaços do mesmo metal se tocarem no vácuo do espaço, eles se fundem permanentemente (soldagem a frio)."
            ];
            return reply(`🌌🔭 *CURIOSIDADE DO COSMOS*\n\n${fatos[Math.floor(Math.random() * fatos.length)]}`);
        }
};
