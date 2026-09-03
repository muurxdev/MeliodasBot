/**
 * Comando .cookies
 * Gerencia cookies do yt-dlp por usuário e global
 */

const { getCookiesPathFor, validateCookiesFile, saveUserCookies, removeUserCookies, getCookieStatus, COOKIES_FILE } = require('../../services/media/mediaArgs')
const { isOwnerJid } = require('../../config/env')
const logger = require('../../core/logger')

module.exports = {
    name: 'cookies',
    aliases: ['cookie', 'managecookies'],
    category: 'media',
    description: 'Gerencia cookies do yt-dlp para downloads (global e por usuário)',
    cooldownMs: 5000,
    execute: async ({ sender, text, reply, info, client, quotedText }) => {
        const rawInput = (text || quotedText || '').trim()
        const args = rawInput.toLowerCase()

        // Sem argumentos: mostra status
        if (!args) {
            const status = getCookieStatus(sender)
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🍪 *GERENCIADOR DE COOKIES*   ║\n'
            doc += '╚══════════════════════════════╝\n\n'

            doc += '╭━〔 📊 STATUS ATUAL 〕━⬣\n'

            if (status.global.ok) {
                doc += `┃ 🌐 *Global:* ✅ Válido (${status.global.count} cookies, ${status.global.domain})\n`
            } else {
                doc += `┃ 🌐 *Global:* ❌ ${status.global.reason}\n`
            }

            if (status.user) {
                if (status.user.ok) {
                    doc += `┃ 👤 *Seu cookie:* ✅ Válido (${status.user.count} cookies, ${status.user.domain})\n`
                } else {
                    doc += `┃ 👤 *Seu cookie:* ❌ ${status.user.reason}\n`
                }
            } else {
                doc += '┃ 👤 *Seu cookie:* ❌ Nenhum configurado\n'
            }

            doc += `┃ 🔀 *Em uso:* ${status.activeSource === 'user' ? '👤 Seu cookie' : '🌐 Global'}\n`
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '╭━〔 📝 COMO ENVIAR 〕━⬣\n'
            doc += '┃ Cole o conteúdo do arquivo cookies.txt como mensagem\n'
            doc += '┃ Responda esta mensagem com o texto dos cookies\n'
            doc += '┃ Ou envie: `.cookies <cole o conteúdo aqui>`\n'
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            if (isOwnerJid(sender)) {
                doc += '╭━〔 👑 DONO — COOKIE GLOBAL 〕━⬣\n'
                doc += '┃ Para setar o cookie *global*, envie o conteúdo\n'
                doc += '┃ com o prefixo `global` no início:\n'
                doc += '┃ `.cookies global <cole o conteúdo>`\n'
                doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            }

            doc += '💡 _Exporte com a extensão "Get cookies.txt LOCALLY"._'

            return reply(doc.trim())
        }

        // .cookies remover
        if (args === 'remover' || args === 'remove' || args === 'delete') {
            const removed = removeUserCookies(sender)
            if (removed) {
                return reply('✅ *Cookie Removido!* Seu cookie pessoal foi removido.\nAgora o bot usará o cookie global (se disponível).')
            }
            return reply('⚠️ *Nenhum cookie pessoal encontrado.*')
        }

        // .cookies status
        if (args === 'status') {
            return module.exports.execute({ sender, text: '', reply, info, client, quotedText: '' })
        }

        // .cookies global <conteúdo> — dono setando cookie global
        if (args.startsWith('global ') && isOwnerJid(sender)) {
            const content = rawInput.slice(7).trim()
            if (!content || content.length < 20) {
                return reply('❌ *Conteúdo inválido.* O cookie precisa ser o texto completo no formato Netscape.')
            }
            const fs = require('fs')
            try {
                fs.writeFileSync(COOKIES_FILE, content, 'utf8')
                const validation = validateCookiesFile(COOKIES_FILE)
                if (validation.ok) {
                    return reply(`✅ *Cookie Global Salvo!* ${validation.count} cookies (${validation.domain}) validados com sucesso.`)
                } else {
                    return reply(`⚠️ *Cookie salvo, mas validação falhou:* ${validation.reason}\n${validation.detail || ''}`)
                }
            } catch (err) {
                logger.error(`[COOKIES] Erro ao salvar cookie global: ${err.message}`)
                return reply('❌ *Erro ao salvar o cookie global.* Tente novamente.')
            }
        }

        // .cookies <conteúdo> — usuário setando cookie pessoal
        const content = rawInput
        if (content.length < 20) {
            return reply('❌ *Conteúdo inválido.* Cole o texto completo do arquivo cookies.txt no formato Netscape.')
        }

        const saved = saveUserCookies(sender, content)
        if (saved) {
            const userPath = require('path').join(require('../../config/paths').dataDir, 'cookies', sender.replace(/[^a-zA-Z0-9._-]/g, '_') + '.txt')
            const validation = validateCookiesFile(userPath)
            if (validation.ok) {
                return reply(`✅ *Seu Cookie Salvo!* ${validation.count} cookies (${validation.domain}) validados.\nAgora seus downloads usarão este cookie.`)
            }
            return reply('✅ *Cookie salvo!* (validação pendente — será usado nos próximos downloads)')
        }

        return reply('❌ *Erro ao salvar o cookie.* Tente novamente.')
    }
}
