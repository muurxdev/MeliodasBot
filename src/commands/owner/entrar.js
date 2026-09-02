/**
 * MeliodasBot — Comando .entrar
 * Faz o bot entrar em um grupo a partir de um link de convite do WhatsApp
 */

const logger = require('../../core/logger')

module.exports = {
    name: 'entrar',
    aliases: ['join', 'entrargrupo', 'joinlink'],
    category: 'owner',
    description: 'Faz o bot entrar em um grupo via link de convite',
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, client, reply }) => {
        const link = (text || '').trim()

        if (!link) {
            return reply('❌ Informe o link de convite do grupo.\n\n📌 *Exemplo:* `.entrar https://chat.whatsapp.com/ABCDEF123456`')
        }

        const match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/)
        const inviteCode = match ? match[1] : link.replace(/https?:\/\/chat\.whatsapp\.com\//, '').trim()

        if (!inviteCode || inviteCode.length < 15) {
            return reply('❌ Link ou código de convite inválido.')
        }

        try {
            await reply('⏳ *Processando convite e entrando no grupo...*')
            const response = await client.groupAcceptInvite(inviteCode)
            logger.info(`[GROUP JOIN] Bot entrou no grupo: ${response}`)
            return reply(`✅ *Sucesso:* Bot entrou no grupo! (ID: \`${response || 'Grupo Conectado'}\`)`)
        } catch (err) {
            logger.error('[ENTRAR ERROR]', err)
            return reply(`❌ *Falha ao entrar no grupo:* ${err.message}`)
        }
    }
}

