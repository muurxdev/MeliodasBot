module.exports = {
    name: 'host',
    aliases: ['hosts', 'hospedagem'],
    category: 'dev',
    description: 'Serviços de hospedagem e nuvem recomendados',
    execute: async ({ reply }) => {
        const hostInfo = `☁️ *HOSPEDAGENS ÚTEIS E VPS:*

⚡ *Vercel:* Frontend e Serverless
🟢 *Render:* Web Services e Workers
🚂 *Railway:* Infraestrutura moderna
🐳 *DigitalOcean:* VPS e Droplets
☁️ *AWS / GCP:* Nuvem corporativa`

        await reply(hostInfo)
    }
}

