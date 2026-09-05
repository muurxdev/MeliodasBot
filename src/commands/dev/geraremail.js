/**
 * Comando .geraremail — Gera endereços de email fictícios formatados para testes
 */
module.exports = {
    name: "geraremail",
    aliases: ["fakeemail"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera endereços de email fictícios formatados para testes",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const names = ['alex', 'bruno', 'carla', 'diego', 'elena', 'felipe', 'gabriel', 'helena', 'igor', 'juliana', 'lucas', 'mariana'];
            const lasts = ['silva', 'santos', 'oliveira', 'souza', 'lima', 'pereira', 'ferreira', 'costa', 'rodrigues', 'almeida'];
            const domains = ['exemplo.com', 'testemail.org', 'devmail.net', 'sandbox.io', 'mailmock.dev'];
            const n = names[Math.floor(Math.random() * names.length)];
            const l = lasts[Math.floor(Math.random() * lasts.length)];
            const num = Math.floor(Math.random() * 900) + 100;
            const d = domains[Math.floor(Math.random() * domains.length)];
            return reply(`📧 *E-MAIL FICTÍCIO GERADO*\n\n\`${n}.${l}${num}@${d}\``);
        }
};
