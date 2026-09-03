/**
 * Comando .sair / .sairbot / .leavebot
 * Faz o próprio bot sair de um grupo especificado por JID ou do grupo atual
 * Comando exclusivo dos Donos do bot
 */

const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'sair',
    aliases: ['sairbot', 'leavebot', 'quitbot', 'desconectar', 'sairgrupo', 'quitgroup'],
    category: 'owner',
    description: 'Faz o bot se retirar do grupo atual ou de um JID específico',
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, from, isGroup, client, reply, sender }) => {
        const botName = getBotName()
        const targetGroup = (text || '').trim() || (isGroup ? from : null)

        if (!targetGroup || !targetGroup.endsWith('@g.us')) {
            return reply(
                '❌ *Informe o ID do grupo ou execute o comando dentro do grupo que deseja que o bot saia!*\n\n' +
                '📌 *Exemplo:* `.sair 120363000000000000@g.us`\n' +
                '💡 *Ou simplesmente digite `.sair` dentro do grupo.*'
            )
        }

        try {
            await reply(`👋 *${botName} saindo do grupo...* Até logo!`)
            await new Promise(r => setTimeout(r, 1000))
            await client.groupLeave(targetGroup)
            logger.info(`[GROUP LEAVE] Dono ${sender} fez o bot sair do grupo: ${targetGroup}`)
        } catch (err) {
            logger.error('[SAIR ERROR]', err)
            return reply(`❌ *Erro ao sair do grupo:* ${err.message}`)
        }
    }
}
