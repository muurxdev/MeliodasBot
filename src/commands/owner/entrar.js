/**
 * Comando .entrar
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
            // O Baileys lança "conflict" (HTTP 409) quando o bot JÁ é membro do grupo.
            // Isso não é falha — é o caso comum de reenviar o link. Resolvemos o nome
            // do grupo pelo próprio convite e respondemos de forma amigável.
            const reason = String(err?.message || '').toLowerCase()
            const status = err?.data || err?.output?.statusCode
            if (reason.includes('conflict') || status === 409) {
                let nome = ''
                try {
                    const infoConvite = await client.groupGetInviteInfo(inviteCode)
                    nome = infoConvite?.subject ? ` *${infoConvite.subject}*` : ''
                } catch (e) {
                    logger.warn(`[ENTRAR] groupGetInviteInfo falhou no conflito: ${e.message}`)
                }
                return reply(`ℹ️ *Eu já estou nesse grupo${nome}.* Não precisa me adicionar de novo.`)
            }
            if (reason.includes('gone') || status === 410) {
                return reply('❌ *Convite expirado.* Peça um link novo ao administrador do grupo.')
            }
            if (reason.includes('not-authorized') || reason.includes('forbidden') || status === 401 || status === 403) {
                return reply('❌ *Convite inválido ou revogado.* Gere um novo link de convite.')
            }
            logger.error('[ENTRAR ERROR]', err)
            return reply(`❌ *Falha ao entrar no grupo:* ${err.message}`)
        }
    }
}

