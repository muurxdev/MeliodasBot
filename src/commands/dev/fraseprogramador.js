/**
 * Comando .fraseprogramador — Uma frase clássica do mundo dev
 */
module.exports = {
    name: "fraseprogramador",
    aliases: ["devquote","frasedev"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Uma frase clássica do mundo dev",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const Q=['"Funciona na minha máquina." — Todo dev, um dia.','"Só mais um bug e eu durmo." — Ninguém nunca.','"Não é bug, é uma feature não documentada."','"Semana que vem eu refatoro." — Dívida técnica eterna.','"Quem escreveu isso?" (git blame) "...fui eu."']; return reply('👨‍💻 '+Q[Math.floor(Math.random()*Q.length)]); }
};
