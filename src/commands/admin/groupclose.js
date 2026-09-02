const logger = require('../../core/logger')
const groupAuthService = require('../../services/groupAuthService')
const groupControlService = require('../../services/groupControlService')

module.exports = {
    name: 'fechargrupo',
    aliases: ['fechar', 'fecharg', 'fechagrupo', 'trancar', 'closegroup', 'trancargrupo'],
    category: 'admin',
    description: 'Fecha o grupo (só admins falam), temporário ou indefinido. Ex: .fechargrupo 1h, .fechargrupo 30m, .fechargrupo',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ from, args, client, reply }) => {
        try {
            const groupData = await groupAuthService.getGroupData(from, { refresh: true })
            if (!groupData.isBotAdmin) {
                return reply('❌ O bot não é administrador deste grupo. Promova o bot para executar esta ação.')
            }

            const durationStr = args[0] ? args[0].toLowerCase().trim() : null
            if (durationStr && !/^\d+[smhd]$/i.test(durationStr)) {
                return reply('❌ *Tempo inválido.* Use sem tempo (indefinido) ou com duração: `30m`, `2h`, `1d`. Exemplo: `.fechargrupo 2h`')
            }

            const res = await groupControlService.closeGroup(client, from, { durationStr })

            if (res.until) {
                const d = new Date(res.until)
                const untilFmt = d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                return reply(`🔒 *GRUPO FECHADO!*\n\n⛔ Apenas administradores podem enviar mensagens.\n⏱️ *Reabertura automática:* ${untilFmt}\n\n_Para reabrir antes, use_ *.abrirgrupo*`)
            }

            return reply(`🔒 *GRUPO FECHADO INDEFINIDAMENTE!*\n\n⛔ Apenas administradores podem enviar mensagens.\n\n_Use_ *.abrirgrupo* _para reabrir._`)
        } catch (err) {
            logger.error('[FECHARGRUPO ERROR]', err)
            return reply(`❌ *Falha ao fechar o grupo:* ${err.message}`)
        }
    }
}