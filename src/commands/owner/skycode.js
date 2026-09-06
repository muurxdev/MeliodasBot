/**
 * Comando .skycode — painel do GRUPO (Skycode). Exclusivo do Dono.
 *
 * Menu enxuto, só com o que potencializa o grupo: moderação, entrada/saída de
 * membros, configuração e ferramentas dev. NADA de RPG, cassino ou jogos.
 * Traz também a referência das CHAVES usadas nas mensagens de boas-vindas/saída.
 */

const { resolveModuleKey } = require('../../config/modules')
const moduleState = require('../../services/moduleStateService')
const { getBotName } = require('../../config/botConfig')
const ui = require('../../utils/ui')

// Módulos que "potencializam o grupo" — o resto (rpg, cassino, jogos, diversão,
// figurinhas, downloads) fica de fora de propósito.
const MODULOS_GRUPO = ['moderacao', 'mensagens-grupo', 'dev', 'utilidades']

const TITULOS = {
    'moderacao': { icon: '🛡️', label: 'Moderação' },
    'mensagens-grupo': { icon: '📣', label: 'Entrada, saída & mensagens' },
    'dev': { icon: '👨‍💻', label: 'Ferramentas dev' },
    'utilidades': { icon: '🧭', label: 'Utilidades' }
}

const MAX_POR_SECAO = 8

module.exports = {
    name: 'skycode',
    aliases: ['sky', 'painelgrupo', 'menugrupo', 'skycor'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Painel do grupo Skycode — moderação, entrada/saída, config e dev (só Dono)',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.', from, isGroup, args }) => {
        const dispatcher = require('../../handlers/commandDispatcher')
        const scope = moduleState.scopeOf(from, isGroup)
        const sub = (args[0] || '').toLowerCase()

        if (sub === 'on' || sub === 'ativar' || sub === 'start' || sub === '1') {
            moduleState.setModule('skycode', true, scope)
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║   🛰️ *SKYCODE DEVNET PROTOCOL*     ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🟢 *SYS_STATUS:* ONLINE [ACCESS_GRANTED]\n`
            doc += `📡 *Escopo:* \`${scope}\`\n`
            doc += `🔒 *Nível de Acesso:* ROOT_DEV (Dono)\n`
            doc += `⚙️ *Subsistemas Ativos:* Moderação, Entrada/Saída, Terminal Dev & Diagnóstico\n\n`
            doc += `💡 _Para visualizar o terminal:_ \`${prefix}skycode\`\n`
            doc += `💡 _Para desativar:_ \`${prefix}skycode off\``
            return reply(doc.trim())
        }

        if (sub === 'off' || sub === 'desativar' || sub === 'stop' || sub === '0') {
            moduleState.setModule('skycode', false, scope)
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║   🛰️ *SKYCODE DEVNET PROTOCOL*     ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🔴 *SYS_STATUS:* OFFLINE [ACCESS_RESTRICTED]\n`
            doc += `📡 *Escopo:* \`${scope}\`\n`
            doc += `🔒 Protocolo encerrado com sucesso.\n\n`
            doc += `💡 _Para reativar:_ \`${prefix}skycode on\``
            return reply(doc.trim())
        }

        // O gate do dispatcher isenta o Dono, e este comando é só do Dono — então
        // sem esta checagem o `.skycode off` não teria efeito nenhum.
        if (!moduleState.isModuleEnabled('skycode', scope)) {
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║   🛰️ *SKYCODE DEVNET PROTOCOL*     ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🔴 *STATUS:* TERMINAL OFFLINE neste ambiente.\n`
            doc += `_Módulo exclusivo para grupos técnicos de desenvolvimento e infraestrutura._\n\n`
            doc += `⚡ *Para inicializar o terminal:* \`${prefix}skycode on\``
            return reply(doc.trim())
        }

        // .skycode chaves → só a referência de variáveis das mensagens
        if (sub === 'chaves' || sub === 'variaveis' || sub === 'placeholders') {
            return reply(ui.screen({
                title: '🔑 *CHAVES DAS MENSAGENS* 🔑',
                intro: 'Use estas variáveis ao criar a mensagem de *entrada* ou *saída*.\nO bot troca cada uma pelo valor real na hora.',
                sections: [{
                    title: 'Variáveis disponíveis', icon: '🧩', lines: [
                        '`{user}` — marca o membro (@ dele). _Alt.:_ `{usuario}`, `{membro}`',
                        '`{grupo}` — nome do grupo. _Alt.:_ `{nome}`',
                        '`{desc}` — descrição do grupo',
                        '`{membros}` — total de membros agora',
                        '`{hora}` — horário atual'
                    ]
                }, {
                    title: 'Exemplo', icon: '💡', lines: [
                        `\`${prefix}welcome msg Bem-vindo {user} ao {grupo}! Agora somos {membros}. 🕐 {hora}\``,
                        `\`${prefix}leave msg {user} saiu do {grupo}. Restaram {membros}.\``
                    ]
                }],
                hint: `_Ver o painel completo:_ \`${prefix}skycode\``
            }))
        }

        // Painel: lista os comandos do grupo, por área, com estado ON/OFF do ambiente
        const porModulo = {}
        for (const cmd of dispatcher.getCommands().values()) {
            const mk = resolveModuleKey(cmd)
            if (!MODULOS_GRUPO.includes(mk)) continue
            ;(porModulo[mk] = porModulo[mk] || []).push(cmd)
        }

        const sections = []
        for (const mk of MODULOS_GRUPO) {
            const lista = (porModulo[mk] || []).sort((a, b) => a.name.localeCompare(b.name))
            if (!lista.length) continue
            const on = moduleState.isModuleEnabled(mk, scope)
            const linhas = lista.slice(0, MAX_POR_SECAO).map(c => `\`${prefix}${c.name}\` — ${(c.description || '').slice(0, 30)}`)
            if (lista.length > MAX_POR_SECAO) linhas.push(`_…e mais ${lista.length - MAX_POR_SECAO} comandos_`)
            linhas.unshift(`${on ? '🟢 módulo ON' : '🔴 módulo OFF'} · \`${prefix}modulo ${on ? 'off' : 'on'} ${mk}\``)
            sections.push({ title: `${TITULOS[mk].label} (${lista.length})`, icon: TITULOS[mk].icon, lines: linhas })
        }

        sections.push({
            title: 'Entrada & saída de membros', icon: '🚪', lines: [
                `\`${prefix}welcome on/off\` — ativa a mensagem de entrada`,
                `\`${prefix}leave on/off\` — ativa a mensagem de saída`,
                `\`${prefix}skycode chaves\` — **variáveis** p/ montar as mensagens`,
                '_Chaves:_ `{user}` `{grupo}` `{desc}` `{membros}` `{hora}`'
            ]
        })

        return reply(ui.screen({
            title: '🛰️ *PAINEL SKYCODE* 🛰️',
            intro: `👑 *${getBotName()}* — painel do grupo (só Dono)\n📍 *Ambiente:* ${scope === moduleState.PV_SCOPE ? '💬 Privado' : `👥 \`${scope}\``}\n_Só o que potencializa o grupo. RPG, cassino e jogos ficam fora daqui._`,
            sections,
            hint: `_Liberar tudo aqui:_ \`${prefix}modulo on all\` · _Ver módulos:_ \`${prefix}modulo\``
        }))
    }
}
