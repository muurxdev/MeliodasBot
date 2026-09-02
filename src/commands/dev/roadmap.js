module.exports = {
    name: 'roadmap',
    aliases: ['trilha'],
    category: 'dev',
    description: 'Trilhas de aprendizado para carreiras em desenvolvimento',
    execute: async ({ text, reply }) => {
        const t = text ? text.toLowerCase().trim() : ''
        if (t === 'frontend') return reply('🧭 *Roadmap Frontend:* https://roadmap.sh/frontend')
        if (t === 'backend') return reply('🧭 *Roadmap Backend:* https://roadmap.sh/backend')
        if (t === 'mobile' || t === 'android') return reply('🧭 *Roadmap Mobile:* https://roadmap.sh/android')
        return reply('❌ Digite: .roadmap frontend, .roadmap backend ou .roadmap mobile')
    }
}