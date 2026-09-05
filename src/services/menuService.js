/**
 * Gerador de menu a partir do registro de comandos.
 *
 * Substitui o menu.js hardcoded (51KB) por geração dinâmica: todo comando com
 * `category` aparece automaticamente, agrupado por subcategoria (taxonomyService),
 * com o mesmo vocabulário visual do menu antigo e paginação para caber no WhatsApp.
 *
 * Visibilidade por cargo: esconde comandos acima do nível do usuário (ownerOnly=5,
 * adminOnly=3, minRole=N). Não filtra por groupOnly/botAdminOnly — o menu é um
 * catálogo estável (esses comandos aparecem, mas exigem grupo/bot-admin ao rodar).
 */

const { CATEGORIES, BY_KEY } = require('../config/categories')
const { resolveSubcategory } = require('./taxonomyService')

const CAPTION_BUDGET = 1000
const FOOTER_RESERVE = 150   // espaço p/ nav + "🔙 .menu" anexados após a paginação
const TEXT_BUDGET = 3500      // páginas seguintes vão como texto

const ROLE_OWNER = 5
const ROLE_ADMIN = 3

/** Nível de cargo mínimo para VER o comando no menu. */
function requiredLevel(cmd) {
    if (cmd.ownerOnly) return ROLE_OWNER
    if (cmd.adminOnly) return ROLE_ADMIN
    if (typeof cmd.minRole === 'number') return cmd.minRole
    return 1
}

function canSeeInMenu(cmd, userLevel) {
    if (cmd.hidden) return false
    return userLevel >= requiredLevel(cmd)
}

/** Agrupa comandos visíveis de uma categoria por subcategoria. */
function groupByCategory(registry, categoryKey, userLevel) {
    const groups = new Map()   // subcategoria -> [cmd]
    for (const cmd of registry.values()) {
        if (cmd.category !== categoryKey) continue
        if (!canSeeInMenu(cmd, userLevel)) continue
        const sub = resolveSubcategory(cmd)
        if (!groups.has(sub)) groups.set(sub, [])
        groups.get(sub).push(cmd)
    }
    for (const arr of groups.values()) arr.sort((a, b) => a.name.localeCompare(b.name))
    return groups
}

const SECTION_TOP = (title) => `╭━〔 ${title} 〕━⬣\n`
const SECTION_BOT = `╰━━━━━━━━━━━━━━━━━━⬣\n`

/** Linha de um comando dentro de uma seção com todos os seus aliases. */
function cmdLine(cmd, prefix, registry) {
    let aliasesHint = ''
    if (Array.isArray(cmd.aliases) && cmd.aliases.length > 0) {
        const valid = Array.from(new Set(cmd.aliases.filter(a => a && a !== cmd.name)))
        if (valid.length > 0) {
            aliasesHint = ` [${valid.map(a => `\`${prefix}${a}\``).join(', ')}]`
        }
    }
    return `┃ ➤ \`${prefix}${cmd.name}\`${aliasesHint} — ${cmd.description || 'Comando do bot'}\n`
}

/**
 * Compõe páginas a partir de unidades (dividers de categoria e seções com linhas),
 * paginando no nível da LINHA. Uma seção que cruza a fronteira de página é fechada
 * (`╰`) e reaberta na página seguinte com "(cont.)".
 *
 * @param {Array} units - [{type:'divider', text} | {type:'section', title, lines:string[]}]
 */
function composePages(units, firstBudget, restBudget) {
    const pages = []
    let cur = ''
    let budget = firstBudget
    let openSection = null   // título da seção aberta na página atual

    const flush = () => {
        if (openSection) { cur += SECTION_BOT; openSection = null }
        if (cur.trim()) pages.push(cur)
        cur = ''
        budget = restBudget
    }

    for (const unit of units) {
        if (unit.type === 'divider') {
            if (cur.length + unit.text.length + 2 > budget) flush()
            cur += unit.text + '\n'
            continue
        }
        // seção: abre header e vai colocando linhas, quebrando quando estoura
        let header = SECTION_TOP(unit.title)
        if (cur.length + header.length + 40 > budget) flush()
        cur += header
        openSection = unit.title
        for (const line of unit.lines) {
            if (cur.length + line.length + SECTION_BOT.length > budget) {
                cur += SECTION_BOT; openSection = null
                pages.push(cur); cur = ''; budget = restBudget
                cur += SECTION_TOP(`${unit.title} (cont.)`)
                openSection = `${unit.title} (cont.)`
            }
            cur += line
        }
        cur += SECTION_BOT
        openSection = null
    }
    if (cur.trim()) pages.push(cur)
    return pages.length ? pages : ['']
}

function header(title) {
    return `╔══════════════════════════════╗\n║   ${title}   ║\n╚══════════════════════════════╝\n\n`
}

/**
 * Constrói o menu.
 * @param {object} o
 * @param {string|null} o.category  key/atalho de categoria; null = painel principal
 * @param {number} o.page           página (1-based)
 * @param {string} o.prefix
 * @param {number} o.userLevel      nível de cargo do usuário
 * @param {string} o.botName
 * @param {Map} o.registry          dispatcher.getCommands()
 * @param {number} o.totalAliases
 * @returns {{pages: string[], page: number, totalPages: number, mediaKey: string, total: number}}
 */
function buildMenu({ category = null, page = 1, prefix = '.', userLevel = 1, botName = 'Bot', registry, totalAliases = 0 }) {
    const isAll = category === 'all' || category === 'todos'
    const catKey = isAll ? null : (BY_KEY[category] ? category : null)

    // ── Painel principal (índice de categorias) ──
    if (!catKey && !isAll) {
        let doc = header(`🤖 *${botName}* 🤖`)
        const total = registry.size
        doc += `📌 *Prefixo Ativo:* \`${prefix}\` | ⚡ *1.000 Comandos Reais* (+${totalAliases} Aliases)\n`
        doc += `👑 *Feito Histórico:* 1.000 comandos únicos ativos com RPG, Economia e Mídia!\n`
        doc += `💡 _Digite o comando da categoria para ver todos os comandos e aliases:_\n\n`
        doc += `╭━〔 📂 CATEGORIAS DE COMANDOS & ALIASES 〕━⬣\n`
        for (const c of CATEGORIES) {
            // conta quantos o usuário pode ver, e esconde categorias vazias p/ ele
            let count = 0
            let aliasCount = 0
            for (const cmd of registry.values()) {
                if (cmd.category === c.key && canSeeInMenu(cmd, userLevel)) {
                    count++
                    if (Array.isArray(cmd.aliases)) aliasCount += cmd.aliases.length
                }
            }
            if (count === 0) continue
            doc += `┃ ${c.emoji} \`${prefix}menu ${c.key}\` ➔ ${c.label} (${count} cmds · ${aliasCount} aliases)\n`
        }
        doc += `┃ 🌟 \`${prefix}menu all\` ➔ Ver o Catálogo Completo dos 1.000 Comandos\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `╭━〔 ℹ️ ATALHOS RÁPIDOS 〕━⬣\n`
        doc += `┃ ➤ \`${prefix}help <comando>\` — Instruções de qualquer comando\n`
        doc += `┃ ➤ \`${prefix}dossie\` / \`${prefix}perfil\` — Seu perfil completo\n`
        doc += `┃ ➤ \`${prefix}ia <pergunta>\` — Inteligência Artificial e busca Web\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `💡 *Dica:* _Abra um submenu digitando direto o nome (ex:_ \`${prefix}rpg\`_,_ \`${prefix}eco\`_,_ \`${prefix}admin\`_)!_`
        return { pages: [doc], page: 1, totalPages: 1, mediaKey: 'main', total }
    }

    // ── Catálogo completo ou categoria específica ──
    const keys = isAll ? CATEGORIES.map(c => c.key) : [catKey]
    const units = []
    let total = 0
    let totalCatAliases = 0
    for (const key of keys) {
        const groups = groupByCategory(registry, key, userLevel)
        if (groups.size === 0) continue
        if (isAll) {
            const meta = BY_KEY[key]
            units.push({ type: 'divider', text: `\n${meta.emoji} ═══ *${meta.label.toUpperCase()}* ═══` })
        }
        for (const [sub, cmds] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
            total += cmds.length
            for (const c of cmds) {
                if (Array.isArray(c.aliases)) totalCatAliases += c.aliases.length
            }
            units.push({ type: 'section', title: sub, lines: cmds.map(c => cmdLine(c, prefix, registry)) })
        }
    }

    const meta = catKey ? BY_KEY[catKey] : null
    const titleText = isAll ? '🌟 *CATÁLOGO COMPLETO* 🌟' : `${meta.emoji} *${meta.label.toUpperCase()}* ${meta.emoji}`
    const statsSub = `📊 *Total:* ${total} Comandos · ${totalCatAliases} Aliases Ativos\n\n`
    const head = header(titleText) + statsSub

    const bodyPages = composePages(units, CAPTION_BUDGET - head.length - FOOTER_RESERVE, TEXT_BUDGET - FOOTER_RESERVE)
    const totalPages = bodyPages.length
    const safePage = Math.min(Math.max(1, page), totalPages)

    const pages = bodyPages.map((body, i) => {
        let doc = (i === 0 ? head : `${titleText}  — pág. ${i + 1}/${totalPages}\n${statsSub}`) + body
        const navTarget = isAll ? 'all' : catKey
        if (totalPages > 1 && i + 1 < totalPages) {
            doc += `\n▸ _Página ${i + 1}/${totalPages} — \`${prefix}menu ${navTarget} ${i + 2}\` para continuar_`
        } else if (totalPages > 1) {
            doc += `\n▸ _Página ${i + 1}/${totalPages} (fim)_`
        }
        doc += `\n🔙 \`${prefix}menu\``
        return doc.trim()
    })

    return { pages, page: safePage, totalPages, mediaKey: catKey || 'main', total }
}

module.exports = { buildMenu, canSeeInMenu, requiredLevel }
