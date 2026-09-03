module.exports = {
    name: 'hora',
    aliases: ['time'],
    category: 'dev',
    description: 'Exibe a hora atual do servidor',
    execute: async ({ reply }) => {
        const hora = new Date().toLocaleTimeString('pt-BR')
        await reply(`🕒 *Hora atual:* ${hora}`)
    }
}

