module.exports = {
    name: 'color',
    aliases: ['hex', 'cor'],
    category: 'dev',
    description: 'Exibe informações sobre uma cor hexadecimal',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite uma cor hexadecimal. Exemplo: .color #3498db')
        const hex = text.replace(/#/g, '').trim()
        await reply('🎨 https://www.colorhexa.com/' + hex)
    }
}