module.exports = {
    name: 'github',
    aliases: ['git'],
    category: 'dev',
    description: 'Retorna o link do perfil do GitHub informado',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite o nome de usuário do GitHub. Exemplo: .github torvalds')
        await reply(`🌐 https://github.com/${encodeURIComponent(text.trim())}`)
    }
}

