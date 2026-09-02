const { esperar } = require('../../utils/helpers')
const dataService = require('../../services/dataService')
const logger = require('../../core/logger')

module.exports = {
    name: 'broadcast',
    aliases: ['bc', 'transmissao', 'aviso-global'],
    category: 'owner',
    description: 'Envia um comunicado para todos os grupos onde o bot está ativo',
    ownerOnly: true,
    execute: async ({ text, client, reply }) => {
        if (!text) {
            return reply('❌ Informe a mensagem para o broadcast. Exemplo: .broadcast Mensagem de atualização')
        }

        const configs = dataService.getConfigsData()
        const grupos = Object.keys(configs)

        if (grupos.length === 0) {
            return reply('❌ Nenhum grupo registrado para envio de broadcast.')
        }

        await reply(`📢 *Iniciando broadcast para ${grupos.length} grupos...*`)
        let enviados = 0

        for (const grupo of grupos) {
            try {
                await client.sendMessage(grupo, {
                    text: `📢 *COMUNICADO OFICIAL DO BOT*\n\n${text}\n\n━━━━━━━━━━━━━━━━━━\n👨‍💻 *Administração MeliodasBot*`
                })
                enviados++
                await esperar(1500) // Delay anti-ban entre envios
            } catch (err) {
                logger.warn(`Falha ao enviar broadcast para ${grupo}:`, err.message)
            }
        }

        await reply(`✅ *Broadcast finalizado!*\n\n📤 Enviado com sucesso para ${enviados} de ${grupos.length} grupos.`)
    }
}

