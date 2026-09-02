module.exports = {
    name: 'stack',
    aliases: ['techstack'],
    category: 'dev',
    description: 'Sugestão de stack moderna para desenvolvimento web',
    execute: async ({ reply }) => {
        const stackInfo = `💻 *STACK MODERNA RECOMENDADA:*

🎨 *Frontend:* React + Next.js + TailwindCSS
⚙️ *Backend:* Node.js / TypeScript + Express / Fastify
🗄 *Banco de Dados:* PostgreSQL / MongoDB + Prisma ORM
🚀 *Deploy:* Vercel + Render / Railway`
        await reply(stackInfo)
    }
}