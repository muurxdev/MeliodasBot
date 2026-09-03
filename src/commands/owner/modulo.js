/**
 * Comando .modulo — controle GLOBAL de módulos (camada opt-in "tudo OFF").
 * Só o Dono. Liga/desliga blocos inteiros de comandos, ou tudo de uma vez.
 * Override por comando fica em `.cmdglobal`.
 */

const moduleState = require('../../services/moduleStateService')
const { MODULES, resolveModuleKey } = require('../../config/modules')
const { getBotName } = require('../../config/botConfig')

function countByModule() {
    const dispatcher = require('../../handlers/commandDispatcher')
    const counts = {}
    for (const cmd of dispatcher.getCommands().values()) {
        const k = resolveModuleKey(cmd)
        counts[k] = (counts[k] || 0) + 1
    }
    return counts
}

function render(prefix) {
    const counts = countByModule()
    const mods = moduleState.listModules()
    let doc = `╔══════════════════════════════╗\n`
    doc += `║   🧩 *MÓDULOS DO BOT* 🧩   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `_Tudo nasce OFF. Libere por módulo, por comando (\`${prefix}cmdglobal\`) ou tudo._\n\n`
    doc += `╭━〔 📦 MÓDULOS 〕━⬣\n`
    for (const m of mods) {
        const st = m.enabled ? '🟢 ON ' : '🔴 OFF'
        const n = counts[m.key] || 0
        doc += `┃ ${st} ${m.emoji} \`${m.key}\` — ${m.label} (${n})\n`
    }
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
    doc += `╭━〔 ⚙️ COMO USAR 〕━⬣\n`
    doc += `┃ ➤ \`${prefix}modulo on <chave>\` — liga um módulo\n`
    doc += `┃ ➤ \`${prefix}modulo off <chave>\` — desliga um módulo\n`
    doc += `┃ ➤ \`${prefix}modulo on all\` — liga TUDO\n`
    doc += `┃ ➤ \`${prefix}modulo off all\` — desliga TUDO\n`
    doc += `┃ ➤ \`${prefix}cmdglobal on/off <comando>\` — override por comando\n`
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
    return doc.trim()
}

module.exports = {
    name: 'modulo',
    aliases: ['modulos', 'modules', 'farm', 'farms', 'ligar', 'desligar'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga/desliga módulos inteiros de comandos (camada global opt-in)',
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'status' || sub === 'list' || sub === 'lista') {
            return reply(render(prefix))
        }

        if (sub !== 'on' && sub !== 'off' && sub !== 'ligar' && sub !== 'desligar') {
            return reply(`❌ Uso: \`${prefix}modulo on|off <chave|all>\`\n\n${render(prefix)}`)
        }

        const enable = (sub === 'on' || sub === 'ligar')
        const target = (args[1] || '').toLowerCase()

        if (!target) {
            return reply(`❌ Informe o módulo. Ex.: \`${prefix}modulo ${sub} cassino\` ou \`${prefix}modulo ${sub} all\``)
        }

        if (target === 'all' || target === 'tudo') {
            if (enable) moduleState.enableAll()
            else moduleState.disableAll()
            return reply(`${enable ? '🟢' : '🔴'} *Todos os módulos foram ${enable ? 'LIGADOS' : 'DESLIGADOS'}.*\n\n${render(prefix)}`)
        }

        const res = moduleState.setModule(target, enable)
        if (!res.ok) {
            const validos = MODULES.map(m => m.key).join(', ')
            return reply(`❌ ${res.reason}\n\n📋 Módulos válidos: ${validos}`)
        }
        const label = MODULES.find(m => m.key === target)?.label || target
        return reply(`${enable ? '🟢' : '🔴'} Módulo *${label}* (\`${target}\`) foi ${enable ? 'LIGADO' : 'DESLIGADO'}.\n\n💡 _Veja tudo com_ \`${prefix}modulo\``)
    }
}
