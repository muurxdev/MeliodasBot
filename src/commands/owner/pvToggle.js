/**
 * Comando .pv — Controle do Bot no Privado (PV)
 * Exclusivo do Dono.
 * 
 * Permite ativar ou desativar o bot no PV facilmente:
 *   .pv on   → Ativa os módulos comuns no PV (menos divulgacao)
 *   .pv off  → Desativa os módulos no PV
 *   .pv status → Exibe o status atual do PV
 */

const moduleState = require('../../services/moduleStateService')
const { MODULES } = require('../../config/modules')
const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: 'pv',
    aliases: ['modopv', 'privado', 'pvtogg', 'controlepv'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Ativa, desativa ou consulta o estado dos comandos no Privado (PV)',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.', args }) => {
        const sub = (args[0] || '').toLowerCase()
        const botName = getBotName()
        const pvScope = moduleState.PV_SCOPE

        if (sub === 'on' || sub === 'ativar' || sub === 'ligar' || sub === '1') {
            moduleState.enableAll(pvScope)
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║    💬 *COMANDOS NO PV ATIVADOS* 💬   ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🟢 *Estado:* ATIVADO (Comandos liberados no Privado)\n`
            doc += `🔒 *Nota:* Módulo \`divulgacao\` mantido sob controle do Dono.\n\n`
            doc += `💡 _Para desativar o PV:_ \`${prefix}pv off\`\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        if (sub === 'off' || sub === 'desativar' || sub === 'desligar' || sub === '0') {
            moduleState.disableAll(pvScope)
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║   💬 *COMANDOS NO PV DESATIVADOS* 💬  ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🔴 *Estado:* DESATIVADO (Comandos bloqueados no Privado)\n\n`
            doc += `💡 _Para reativar o PV:_ \`${prefix}pv on\`\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        // Exibe status detalhado do PV
        const mods = moduleState.listModules(pvScope)
        const enabledCount = mods.filter(m => m.enabled).length
        const totalCount = mods.length

        let doc = `╔════════════════════════════════════╗\n`
        doc += `║     💬 *ESTADO DO PRIVADO (PV)* 💬   ║\n`
        doc += `╚════════════════════════════════════╝\n\n`
        doc += `📍 *Ambiente:* Chat Privado (PV)\n`
        doc += `📊 *Módulos Ativos:* ${enabledCount}/${totalCount}\n\n`
        doc += `╭━〔 ⚙️ COMANDOS DE CONTROLE 〕━⬣\n`
        doc += `┃ ➤ \`${prefix}pv on\` — Libera comandos no privado (exceto divulgacao)\n`
        doc += `┃ ➤ \`${prefix}pv off\` — Bloqueia todos os comandos no privado\n`
        doc += `┃ ➤ \`${prefix}modulo on/off <modulo> pv\` — Ajusta módulo específico no PV\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `👑 *${botName}*`
        return reply(doc.trim())
    }
}
