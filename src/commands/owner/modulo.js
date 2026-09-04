/**
 * Comando .modulo — controle dos módulos POR AMBIENTE (camada opt-in "tudo OFF").
 *
 * Só o Dono. O que você liga vale SÓ para o ambiente onde o comando foi dado:
 *   - dentro de um grupo → libera só aquele grupo
 *   - no privado         → libera só o PV
 *   - com um ID no final → libera o grupo daquele ID
 *
 * Exemplos:
 *   .modulo                     → lista os módulos do ambiente atual
 *   .modulo on cassino          → liga cassino neste grupo (ou no PV)
 *   .modulo off all             → desliga tudo neste ambiente
 *   .modulo on all 12036...@g.us→ liga tudo naquele grupo específico
 */

const moduleState = require('../../services/moduleStateService')
const { MODULES, resolveModuleKey } = require('../../config/modules')

function countByModule() {
    const dispatcher = require('../../handlers/commandDispatcher')
    const counts = {}
    for (const cmd of dispatcher.getCommands().values()) {
        const k = resolveModuleKey(cmd)
        counts[k] = (counts[k] || 0) + 1
    }
    return counts
}

/** Nome amigável do escopo. */
function scopeLabel(scope, isGroup) {
    if (scope === moduleState.PV_SCOPE) return '💬 Privado (PV)'
    if (scope === moduleState.GLOBAL_SCOPE) return '🌐 Global'
    return `👥 Grupo \`${scope}\``
}

/** Normaliza um alvo passado pelo usuário (ID de grupo, "pv" ou vazio). */
function resolveTargetScope(arg, from, isGroup) {
    if (!arg) return moduleState.scopeOf(from, isGroup)
    const a = String(arg).trim()
    if (/^pv$|^privado$/i.test(a)) return moduleState.PV_SCOPE
    if (/@g\.us$/i.test(a)) return a
    if (/^\d{5,}$/.test(a)) return `${a}@g.us`   // aceita só os dígitos do ID
    return null
}

function render(scope, isGroup, prefix) {
    const counts = countByModule()
    const mods = moduleState.listModules(scope)
    let doc = `╔══════════════════════════════╗\n`
    doc += `║   🧩 *MÓDULOS DO BOT* 🧩   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `📍 *Ambiente:* ${scopeLabel(scope, isGroup)}\n`
    doc += `_Tudo nasce OFF. O que você liga vale só para ESTE ambiente._\n\n`
    doc += `╭━〔 📦 MÓDULOS 〕━⬣\n`
    for (const m of mods) {
        const st = m.enabled ? '🟢 ON ' : '🔴 OFF'
        doc += `┃ ${st} ${m.emoji} \`${m.key}\` — ${m.label} (${counts[m.key] || 0})\n`
    }
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
    doc += `╭━〔 ⚙️ COMO USAR 〕━⬣\n`
    doc += `┃ ➤ \`${prefix}modulo on <chave>\` — liga aqui\n`
    doc += `┃ ➤ \`${prefix}modulo off <chave>\` — desliga aqui\n`
    doc += `┃ ➤ \`${prefix}modulo on all\` — liga TUDO neste ambiente\n`
    doc += `┃ ➤ \`${prefix}modulo off all\` — desliga TUDO neste ambiente\n`
    doc += `┃ ➤ \`${prefix}modulo on <chave> <idDoGrupo>\` — mira outro grupo\n`
    doc += `┃ ➤ \`${prefix}modulo on all pv\` — libera o privado\n`
    doc += `┃ ➤ \`${prefix}cmdglobal on/off <comando>\` — override por comando\n`
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
    return doc.trim()
}

module.exports = {
    name: 'modulo',
    aliases: ['modulos', 'modules', 'farm', 'farms', 'ligar', 'desligar'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga/desliga módulos de comandos no ambiente atual (grupo, PV ou por ID)',
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup }) => {
        const sub = (args[0] || '').toLowerCase()
        const currentScope = moduleState.scopeOf(from, isGroup)

        if (!sub || sub === 'status' || sub === 'list' || sub === 'lista') {
            return reply(render(currentScope, isGroup, prefix))
        }

        if (!['on', 'off', 'ligar', 'desligar'].includes(sub)) {
            return reply(`❌ Uso: \`${prefix}modulo on|off <chave|all> [idDoGrupo|pv]\`\n\n${render(currentScope, isGroup, prefix)}`)
        }

        const enable = (sub === 'on' || sub === 'ligar')
        const target = (args[1] || '').toLowerCase()
        if (!target) {
            return reply(`❌ Informe o módulo. Ex.: \`${prefix}modulo ${sub} cassino\` ou \`${prefix}modulo ${sub} all\``)
        }

        // 3º argumento (opcional) = escopo alvo (ID de grupo ou "pv")
        const scope = resolveTargetScope(args[2], from, isGroup)
        if (!scope) {
            return reply(`❌ Alvo inválido: \`${args[2]}\`.\n💡 Use o *ID do grupo* (\`...@g.us\`) ou \`pv\`.`)
        }

        if (target === 'all' || target === 'tudo') {
            if (enable) moduleState.enableAll(scope)
            else moduleState.disableAll(scope)
            return reply(`${enable ? '🟢' : '🔴'} *Todos os módulos ${enable ? 'LIGADOS' : 'DESLIGADOS'}* em ${scopeLabel(scope, isGroup)}.\n\n${render(scope, isGroup, prefix)}`)
        }

        const res = moduleState.setModule(target, enable, scope)
        if (!res.ok) {
            return reply(`❌ ${res.reason}\n\n📋 Módulos válidos: ${MODULES.map(m => m.key).join(', ')}`)
        }
        const label = MODULES.find(m => m.key === target)?.label || target
        return reply(`${enable ? '🟢' : '🔴'} Módulo *${label}* (\`${target}\`) ${enable ? 'LIGADO' : 'DESLIGADO'} em ${scopeLabel(scope, isGroup)}.\n\n💡 _Ver tudo:_ \`${prefix}modulo\``)
    }
}
