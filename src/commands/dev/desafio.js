const { desafios } = require('../../utils/constants')

module.exports = {
    name: 'desafio',
    aliases: ['pergunta'],
    category: 'dev',
    description: 'Envia um desafio ou pergunta rápida de programação',
    execute: async ({ reply }) => {
        const desafio = desafios[Math.floor(Math.random() * desafios.length)]
        await reply('🎯 *DESAFIO DO DEV*\n\n' + desafio)
    }
}