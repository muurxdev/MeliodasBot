/**
 * UI compartilhada — "pegada" visual ÚNICA do bot, igual à do .menu central.
 *
 * Use estes helpers em telas de lista/submenu (conquistas, badges, ranking, etc.)
 * para que TODAS tenham o mesmo estilo do menu principal (mesmo cabeçalho, mesmas
 * seções `╭━〔 〕━⬣`, mesmo rodapé). Espelha `menuService.header`.
 */

const { getBotName } = require('../config/botConfig')

/** Cabeçalho em caixa (idêntico ao menu principal). */
function header(title) {
    return `╔══════════════════════════════╗\n║   ${title}   ║\n╚══════════════════════════════╝\n\n`
}

/** Uma linha de conteúdo dentro de uma seção. */
function line(text) {
    return `┃ ${text}\n`
}

/** Uma linha com marcador de comando/ação. */
function bullet(text) {
    return `┃ ➤ ${text}\n`
}

/**
 * Bloco de seção com título e linhas.
 * @param {string} title
 * @param {string[]} lines  já formatadas (sem o `┃`) OU linhas cruas
 * @param {string} [icon]
 */
function section(title, lines = [], icon = '📌') {
    let out = `╭━〔 ${icon} ${String(title).toUpperCase()} 〕━⬣\n`
    for (const l of lines) out += `┃ ${l}\n`
    out += `╰━━━━━━━━━━━━━━━━━━⬣\n`
    return out
}

/** Rodapé padrão com o nome atual do bot. */
function footer(botName) {
    return `👑 *${botName || getBotName()}*`
}

/**
 * Monta uma tela completa no estilo do menu.
 * @param {object} o
 * @param {string} o.title
 * @param {Array<{title:string, icon?:string, lines:string[]}>} [o.sections]
 * @param {string} [o.intro]  texto entre o header e as seções
 * @param {string} [o.hint]   dica final (antes do rodapé)
 * @param {boolean} [o.withFooter=true]
 */
function screen({ title, sections = [], intro = '', hint = '', withFooter = true }) {
    let doc = header(title)
    if (intro) doc += intro.trim() + '\n\n'
    for (const s of sections) {
        if (!s || !s.lines || !s.lines.length) continue
        doc += section(s.title, s.lines, s.icon) + '\n'
    }
    if (hint) doc += `💡 ${hint}\n`
    if (withFooter) doc += footer()
    return doc.trim()
}

module.exports = { header, line, bullet, section, footer, screen }
