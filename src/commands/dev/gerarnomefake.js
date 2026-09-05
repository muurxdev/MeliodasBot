/**
 * Comando .gerarnomefake — Gera um nome completo fictício brasileiro para testes
 */
module.exports = {
    name: "gerarnomefake",
    aliases: ["nomealeatorio"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um nome completo fictício brasileiro para testes",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const first = ['Arthur', 'Bernardo', 'Cauã', 'Davi', 'Enzo', 'Gabriel', 'Heitor', 'Lucas', 'Mateus', 'Nicolas', 'Alice', 'Beatriz', 'Camila', 'Daniele', 'Eduarda', 'Fernanda', 'Giovanna', 'Heloísa', 'Isabela', 'Júlia'];
            const middle = ['Henrique', 'Eduardo', 'Augusto', 'Felipe', 'Vinícius', 'Alexandre', 'Rodrigues', 'Barbosa', 'Ribeiro', 'Carvalho'];
            const last = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro'];
            const f = first[Math.floor(Math.random() * first.length)];
            const m = middle[Math.floor(Math.random() * middle.length)];
            const l = last[Math.floor(Math.random() * last.length)];
            return reply(`👤 *NOME FICTÍCIO GERADO*\n\n*${f} ${m} ${l}*`);
        }
};
