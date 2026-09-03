/**
 * Comando .shutdown
 * Encerra o processo do bot de forma graciosa e segura
 */

const { closeDatabase } = require('../../database/connection')
const { closeBot } = require('../../core/connection')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'shutdown',
    aliases: ['desligar', 'stop', 'pararbot', 'off'],
    category: 'owner',
    description: 'Encerra o processo do bot de forma limpa e segura',
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        await reply('🛑 *DESLIGANDO BOT:* Encerrando conexões, salvando banco de dados e finalizando processo com segurança...')

        logger.info('[SHUTDOWN] Comando .shutdown executado pelo Dono. Encerrando processo...')

        setTimeout(async () => {
            try {
                const { closeBot } = require('../../core/connection')
                await closeBot()
            } catch (e) {}

            try {
                closeDatabase()
            } catch (e) {}

            logger.info(`👋 ${getBotName()} desligado com sucesso.`)
            process.exit(0)
        }, 1500)
    }
}

