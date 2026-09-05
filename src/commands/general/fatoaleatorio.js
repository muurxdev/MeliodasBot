/**
 * Comando .fatoaleatorio — Um fato científico verídico e aleatório: .fatoaleatorio
 */
module.exports = {
    name: "fatoaleatorio",
    aliases: [],
    category: "general",
    subcategory: "Curiosidades",
    description: "Um fato científico verídico e aleatório: .fatoaleatorio",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const fatos = [
                "Bananas são naturalmente radioativas por conterem isótopos de potássio-40!",
                "O encanamento dos tubos de aço da Torre Eiffel pode crescer até 15 cm durante os dias mais quentes do verão devido à dilatação térmica.",
                "Os flamingos só conseguem se alimentar com a cabeça virada de cabeça para baixo!",
                "O coração de uma baleia-azul tem o tamanho aproximado de um carro popular."
            ];
            return reply(`💡 *VOCÊ SABIA?*\n\n${fatos[Math.floor(Math.random() * fatos.length)]}`);
        }
};
