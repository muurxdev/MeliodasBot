/**
 * Comando .desativardm / .ativardm
 * Desativa (ou reativa) o atendimento no PRIVADO do bot para TODOS — sem ser um
 * ban. É uma desativação limpa e reversível, separada do sistema de ban por
 * usuário (.bandm). Ninguém é punido; o PV só fica fechado.
 */

const dataService = require('../../services/dataService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'desativardm',
    aliases: ['fechardm', 'desativarpv', 'fecharpv', 'dmoff', 'ativardm', 'dmon', 'abrirpv', 'ativarpv'],
    category: 'owner',
    subcategory: 'Privado',
    description: 'Desativa o atendimento no privado do bot para todos (sem ban)',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ args, reply, sender, commandName }) => {
        const botName = getBotName()
        const configs = dataService.getConfigsData()
        if (!configs['global']) configs['global'] = {}

        // Reativação: .ativardm / .dmon / argumento on
        const wantsOn = /^(ativardm|dmon|abrirpv|ativarpv)$/i.test(commandName || '') ||
                        ['on', 'ativar', 'abrir'].includes((args[0] || '').toLowerCase())

        configs['global'].blockAllDMs = !wantsOn
        await dataService.saveConfigsData(configs)
        logger.info(`[DM TOGGLE] PV ${wantsOn ? 'ativado' : 'desativado'} (sem ban) por ${sender}`)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ${wantsOn ? '🔓 *PRIVADO ATIVADO*' : '🔒 *PRIVADO DESATIVADO*'}   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `╭━〔 ⚙️ ATENDIMENTO NO PV 〕━⬣\n`
        doc += `┃ ${wantsOn ? '🟢' : '🔴'} *Estado:* ${wantsOn ? 'ATIVO — todos podem usar o PV' : 'DESATIVADO — PV fechado para todos'}\n`
        doc += `┃ ℹ️ *Tipo:* Desativação limpa (NÃO é ban)\n`
        doc += `┃ 👤 *Por:* @${sender.split('@')[0]}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += wantsOn
            ? `✅ _O atendimento no privado foi reaberto para todos._\n`
            : `💡 _Ninguém foi banido. Para reabrir, use_ \`.ativardm\`_._\n`
        doc += `👑 *${botName}*`
        return reply(doc.trim(), [sender])
    }
}
