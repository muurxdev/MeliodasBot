/**
 * Comando .cmdglobal — override GLOBAL por comando (camada opt-in).
 * Só o Dono. Força um comando específico ON/OFF, vencendo o estado do módulo.
 * `auto` remove o override (o comando volta a seguir o módulo).
 */

const moduleState = require('../../services/moduleStateService')
const { resolveModuleKey, BY_KEY } = require('../../config/modules')

module.exports = {
    name: 'cmdglobal',
    aliases: ['cmdon', 'cmdoff', 'comandoglobal', 'overridecmd'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga/desliga um comando específico globalmente (override do módulo)',
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup }) => {
        // Escopo alvo opcional (4º argumento): global | pv | <idDoGrupo>.
        // Sem ele, aplica no ambiente atual. `global` cobre PV + todos os grupos.
        const scopeArg = (args[2] || '').toLowerCase().trim()
        let scope = moduleState.scopeOf(from, isGroup)
        if (/^global$|^geral$/.test(scopeArg)) scope = moduleState.GLOBAL_SCOPE
        else if (/^pv$|^privado$/.test(scopeArg)) scope = moduleState.PV_SCOPE
        else if (/@g\.us$/.test(scopeArg)) scope = scopeArg
        else if (/^\d{5,}$/.test(scopeArg)) scope = `${scopeArg}@g.us`
        const sub = (args[0] || '').toLowerCase()
        const nameArg = (args[1] || '').toLowerCase().replace(/^[./!]/, '')

        if (!sub || sub === 'status' || sub === 'list') {
            const ov = moduleState.listCommandOverrides(scope)
            const keys = Object.keys(ov)
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🎛️ *OVERRIDES POR COMANDO* 🎛️   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            if (!keys.length) {
                doc += `_Nenhum override ativo. Todos os comandos seguem o módulo._\n\n`
            } else {
                for (const k of keys) doc += `┃ ${ov[k] ? '🟢 ON ' : '🔴 OFF'} \`${k}\`\n`
                doc += `\n`
            }
            doc += `╭━〔 ⚙️ USO 〕━⬣\n`
            doc += `┃ ➤ \`${prefix}cmdglobal on <comando> [global|pv|id]\`\n`
            doc += `┃ ➤ \`${prefix}cmdglobal off <comando> [global|pv|id]\`\n`
            doc += `┃ ➤ \`${prefix}cmdglobal auto <comando>\` — segue o módulo\n`
            doc += `┃ _Sem escopo = ambiente atual. \`global\` = PV + todos os grupos._\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣`
            return reply(doc.trim())
        }

        if (!['on', 'off', 'auto'].includes(sub)) {
            return reply(`❌ Uso: \`${prefix}cmdglobal on|off|auto <comando>\``)
        }
        if (!nameArg) {
            return reply(`❌ Informe o comando. Ex.: \`${prefix}cmdglobal ${sub} slots\``)
        }

        // valida se o comando existe
        const dispatcher = require('../../handlers/commandDispatcher')
        const cmd = dispatcher.findCommand ? dispatcher.findCommand(nameArg) : dispatcher.getCommands().get(nameArg)
        if (!cmd) {
            return reply(`❌ Comando \`${nameArg}\` não encontrado.`)
        }

        if (sub === 'auto') {
            moduleState.clearCommand(cmd.name, scope)
            const mk = resolveModuleKey(cmd)
            return reply(`♻️ \`${cmd.name}\` voltou a seguir o módulo *${(BY_KEY[mk]?.label) || mk}*.`)
        }

        const enable = sub === 'on'
        moduleState.setCommand(cmd.name, enable, scope)
        const ambiente = scope === moduleState.GLOBAL_SCOPE ? '🌐 GLOBAL (PV + todos os grupos)'
            : scope === moduleState.PV_SCOPE ? '💬 Privado (PV)'
            : scope === moduleState.scopeOf(from, isGroup) ? 'neste ambiente' : `👥 grupo \`${scope}\``
        return reply(`${enable ? '🟢' : '🔴'} Comando \`${cmd.name}\` forçado para *${enable ? 'ON' : 'OFF'}* em ${ambiente}.`)
    }
}
