/**
 * Comando .setcookiesglobal — cookie GLOBAL do bot (vale para TODOS os usuários).
 *
 * Exclusivo do Dono. O cookie pessoal de cada um fica em `.setcookies` e tem
 * prioridade sobre este. Este aqui é o padrão usado por quem não tem o próprio.
 */

const fs = require('fs')
const path = require('path')
const { dataDir } = require('../../config/paths')
const { validateCookiesFile, getCookiesFilePath } = require('../../services/media/mediaArgs')
const { downloadWhatsAppMedia } = require('../../services/mediaService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'setcookiesglobal',
    aliases: ['setcookieglobal', 'cookieglobal', 'globalcookies', 'youtubeauth'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Define o cookie GLOBAL do bot (vale para todos) — exclusivo do Dono',
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, info, from, client, reply, sender }) => {
        const botName = getBotName()
        const cookiesPath = getCookiesFilePath()
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo
        const quoted = contextInfo?.quotedMessage
        const rawText = (text || '').trim()
        const temDoc = !!(info?.message?.documentMessage || quoted?.documentMessage)

        // Sem conteúdo: status + instruções
        if (!rawText && !temDoc) {
            const st = validateCookiesFile(cookiesPath)
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🌐 *COOKIE GLOBAL* 🌐   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📌 *Status:* ${st.ok ? '🟢 VÁLIDO & ATIVO' : '🔴 AUSENTE OU INVÁLIDO'}\n`
            if (st.ok) {
                doc += `┃ 📦 *Cookies:* ${st.count}\n`
                doc += `┃ 🌐 *Domínio:* ${st.domain}\n`
                doc += '┃ 📂 *Arquivo:* `data/cookies.txt`\n'
            } else {
                doc += `┃ ⚠️ *Motivo:* ${st.reason} (${st.detail || ''})\n`
            }
            doc += '\n╭━〔 📖 COMO ATUALIZAR 〕━⬣\n'
            doc += '┃ 1️⃣ Extensão *Get cookies.txt LOCALLY* no PC\n'
            doc += '┃ 2️⃣ YouTube logado → baixe o `cookies.txt`\n'
            doc += '┃ 3️⃣ Envie o arquivo respondendo com `.setcookiesglobal`\n'
            doc += '┃    _ou cole o conteúdo após o comando_\n'
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _Cookie pessoal de cada usuário:_ `.setcookies` _(tem prioridade sobre o global)_\n\n'
            doc += '👑 *' + botName + '*'
            return reply(doc.trim())
        }

        try {
            let conteudo = ''
            if (temDoc) {
                await reply('⏳ *Baixando e validando o cookie global...*')
                const wrapper = info.message?.documentMessage ? info : {
                    key: { remoteJid: from, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
                    message: quoted
                }
                const buffer = await downloadWhatsAppMedia(wrapper, 'document', client)
                conteudo = buffer.toString('utf8')
            } else {
                conteudo = rawText
            }

            if (!conteudo || conteudo.length < 20) {
                return reply('❌ *Conteúdo inválido ou vazio.* Envie o `cookies.txt` (formato Netscape).')
            }

            const tmp = path.join(dataDir, 'cookies.txt.tmp')
            fs.writeFileSync(tmp, conteudo, 'utf8')
            const v = validateCookiesFile(tmp)
            if (!v.ok) {
                try { fs.unlinkSync(tmp) } catch (_) {}
                return reply(`❌ *Cookie global rejeitado!*\n\n⚠️ *Motivo:* ${v.reason}\n💡 ${v.detail || ''}\n\n_Exporte no formato Netscape oficial._`)
            }
            fs.renameSync(tmp, cookiesPath)
            logger.info(`[COOKIE GLOBAL] ${sender} atualizou o cookie global (${v.count} linhas, ${v.domain})`)

            let ok = '╔══════════════════════════════╗\n'
            ok += '║   ✅ *COOKIE GLOBAL ATIVO* ✅   ║\n'
            ok += '╚══════════════════════════════╝\n\n'
            ok += `┃ 📦 *Cookies:* ${v.count}\n`
            ok += `┃ 🌐 *Domínio:* ${v.domain}\n`
            ok += '┃ 🛡️ *Bypass bot-check:* ativo\n\n'
            ok += '💡 _Vale para todos que não tiverem cookie pessoal (`.setcookies`)._\n\n'
            ok += '👑 *' + botName + '*'
            return reply(ok.trim())
        } catch (err) {
            logger.error('[SETCOOKIESGLOBAL ERROR]', err)
            return reply(`❌ *Erro ao processar o cookie global:* ${err.message}`)
        }
    }
}
