/**
 * Comando .setcookies — cookie PESSOAL (por usuário).
 *
 * Cada pessoa pode enviar o SEU próprio cookies.txt; ele passa a ser usado nos
 * downloads DELA (tem prioridade sobre o cookie global). O cookie GLOBAL, que
 * vale para todo mundo, é setado só pelo Dono em `.setcookiesglobal`.
 */

const fs = require('fs')
const path = require('path')
const { dataDir } = require('../../config/paths')
const { validateCookiesFile, saveUserCookies, removeUserCookies, getCookieStatus, sanitizeJid } = require('../../services/media/mediaArgs')
const { downloadWhatsAppMedia } = require('../../services/mediaService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

/** Extrai o conteúdo do cookie de um documento anexado/citado ou do texto. */
async function extrairConteudo({ info, from, client, rawText, reply }) {
    const contextInfo = info?.message?.extendedTextMessage?.contextInfo
    const quoted = contextInfo?.quotedMessage
    const isDoc = !!(info?.message?.documentMessage || quoted?.documentMessage)
    if (isDoc) {
        await reply('⏳ *Baixando e validando seu arquivo de cookies...*')
        const wrapper = info.message?.documentMessage ? info : {
            key: { remoteJid: from, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
            message: quoted
        }
        const buffer = await downloadWhatsAppMedia(wrapper, 'document', client)
        return buffer.toString('utf8')
    }
    return rawText
}

module.exports = {
    name: 'setcookies',
    aliases: ['setcookie', 'meucookie', 'meuscookies', 'addcookies', 'upcookies'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Envia o SEU cookie pessoal do YouTube (usado só nos seus downloads)',
    cooldownMs: 4000,
    execute: async ({ text, info, from, client, reply, sender }) => {
        const botName = getBotName()
        const rawText = (text || '').trim()
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo
        const temDoc = !!(info?.message?.documentMessage || contextInfo?.quotedMessage?.documentMessage)

        // .setcookies remover
        if (/^(remover|remove|delete|apagar)$/i.test(rawText)) {
            return reply(removeUserCookies(sender)
                ? '✅ *Seu cookie pessoal foi removido.* Seus downloads voltam a usar o cookie global.'
                : '⚠️ Você não tinha cookie pessoal configurado.')
        }

        // Sem conteúdo: mostra status + instruções
        if (!rawText && !temDoc) {
            const st = getCookieStatus(sender)
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🍪 *SEU COOKIE PESSOAL* 🍪   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `👤 *Seu cookie:* ${st.user && st.user.ok ? `🟢 Válido (${st.user.count} cookies, ${st.user.domain})` : '🔴 Não configurado'}\n`
            doc += `🌐 *Cookie global:* ${st.global && st.global.ok ? `🟢 Válido (${st.global.count})` : '🔴 Ausente'}\n`
            doc += `🔀 *Em uso nos seus downloads:* ${st.activeSource === 'user' ? '👤 o seu' : '🌐 o global'}\n\n`
            doc += '╭━〔 📖 COMO ENVIAR O SEU 〕━⬣\n'
            doc += '┃ 1️⃣ No PC, instale a extensão *Get cookies.txt LOCALLY*\n'
            doc += '┃ 2️⃣ Abra o YouTube logado e baixe o `cookies.txt`\n'
            doc += '┃ 3️⃣ Envie o arquivo aqui respondendo com `.setcookies`\n'
            doc += '┃    _ou cole o conteúdo:_ `.setcookies <conteúdo>`\n'
            doc += '┃ 🗑️ Remover o seu: `.setcookies remover`\n'
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '👑 *' + botName + '*'
            return reply(doc.trim())
        }

        try {
            const conteudo = await extrairConteudo({ info, from, client, rawText, reply })
            if (!conteudo || conteudo.length < 20) {
                return reply('❌ *Conteúdo inválido.* Envie o `cookies.txt` no formato Netscape.')
            }
            if (!saveUserCookies(sender, conteudo)) {
                return reply('❌ *Não consegui salvar seu cookie.* Tente novamente.')
            }
            const userPath = path.join(dataDir, 'cookies', sanitizeJid(sender) + '.txt')
            const v = validateCookiesFile(userPath)
            if (!v.ok) {
                removeUserCookies(sender)
                return reply(`❌ *Cookie rejeitado!*\n⚠️ *Motivo:* ${v.reason}\n💡 ${v.detail || ''}\n\n_Exporte no formato Netscape._`)
            }
            logger.info(`[SETCOOKIES] ${sender} salvou cookie pessoal (${v.count} linhas, ${v.domain})`)
            return reply(`✅ *Seu cookie pessoal foi salvo!*\n\n📦 ${v.count} cookies · 🌐 ${v.domain}\n👤 A partir de agora *os seus downloads* usam ele.\n\n_(o cookie global segue valendo para os demais)_`)
        } catch (err) {
            logger.error('[SETCOOKIES ERROR]', err)
            return reply(`❌ *Erro ao processar seu cookie:* ${err.message}`)
        }
    }
}
