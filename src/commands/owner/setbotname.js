/**
 * MeliodasBot — Comando .setname / .setbotname
 * Altera dinamicamente o nome oficial do bot em todos os menus, cards e mensagens
 */

const { setBotName, getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'setbotname',
    aliases: ['setname', 'botname', 'nomebot', 'renomearbot'],
    category: 'owner',
    description: 'Altera o nome padrão exibido pelo bot em todos os menus e cartões',
    ownerOnly: true,
    execute: async ({ text, reply, sender }) => {
        const newName = (text || '').trim()
        if (!newName) {
            return reply(`🤖 *Nome Atual do Bot:* \`${getBotName()}\`\n\n📌 *Como alterar:* \`.setname <novo nome>\`\n\n💡 *Exemplo:* \`.setname ᶜᴿᴬᶻᵞ𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨✖️‿✖️•\``)
        }

        const success = setBotName(newName)
        if (success) {
            logger.info(`[SETNAME] ${sender} alterou o nome do bot para: ${newName}`)
            return reply(`✨ *NOME DO BOT ATUALIZADO COM SUCESSO!*\n\n🤖 *Novo Nome:* \`${newName}\`\n💡 O novo nome agora é exibido em 100% de todos os menus, cards de download e mensagens do bot.`)
        } else {
            return reply('❌ Erro ao salvar o novo nome do bot no banco de dados.')
        }
    }
}
