module.exports = {
    name: 'frontend',
    aliases: ['front'],
    category: 'dev',
    description: 'Roadmap e conceitos de desenvolvimento Frontend',
    execute: async ({ reply }) => {
        const front = `⚛️ *ROADMAP FRONTEND:*

HTML5 → CSS3 → JavaScript Moderno → Git
→ React.js / Next.js
→ Consumo de APIs REST / GraphQL
→ Testes & Deploy

🌐 *Guia Completo:* https://roadmap.sh/frontend`

        await reply(front)
    }
}

