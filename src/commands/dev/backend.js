module.exports = {
    name: 'backend',
    aliases: ['back'],
    category: 'dev',
    description: 'Roadmap e conceitos de desenvolvimento Backend',
    execute: async ({ reply }) => {
        const back = `🟢 *ROADMAP BACKEND:*

Node.js / TypeScript → Express ou NestJS
→ Bancos de Dados (SQL & NoSQL)
→ Autenticação (JWT, OAuth2)
→ Docker & Microsserviços
→ Deploy & CI/CD

🌐 *Guia Completo:* https://roadmap.sh/backend`
        await reply(back)
    }
}