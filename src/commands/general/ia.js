/**
 * MeliodasBot — Comando .ia / .search
 * Inteligência Artificial e Pesquisa Web em tempo real
 */

const { askAI } = require('../../services/aiService')
const logger = require('../../core/logger')

function cleanSearchQuery(rawText) {
    if (!rawText || typeof rawText !== 'string') return ''
    return rawText
        .replace(/[╔═╚╭━╰┃⬣_—|*#`🔍📌✨🤖💡💬]/g, ' ')
        .replace(/\b(RESULTADOS DA WEB|RESULTADOS|Pesquisando e processando|Inteligência|Sobre o Bot|Dossiê|Diagnóstico)\b/gi, ' ')
        .replace(/^[\s\-–—:=]+|[\s\-–—:=]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

module.exports = {
    name: 'ia',
    aliases: ['gpt', 'ai', 'perguntar', 'search', 'pesquisar', 'busca', 'google'],
    category: 'general',
    description: 'Responde dúvidas e realiza pesquisas em tempo real na Web',
    cooldownMs: 3000,
    execute: async ({ text, args = [], reply, quotedText, directText }) => {
        let query = directText || ''
        if (!query && quotedText) {
            query = cleanSearchQuery(quotedText)
        }
        if (!query && text) {
            query = cleanSearchQuery(text)
        }
        if (!query && args.length > 0) {
            query = args.join(' ').trim()
        }
        query = (query || '').trim()

        if (!query) {
            return reply('🧠 *MELIODAS AI & PESQUISA*\n\nEnvie sua dúvida ou termo de pesquisa após o comando.\n\n📌 *Exemplos:*\n• `.ia quem é Nikola Tesla?`\n• `.search últimas notícias sobre astronomia`\n• `.gpt como funciona o Node.js no backend?`\n\n💡 *Dica:* Você também pode responder a qualquer mensagem digitando `.ia`!')
        }

        await reply(`🧠 *Pesquisando e processando:* _"${query.slice(0, 50)}"_... Aguarde.`)

        try {
            const answer = await askAI(query)
            return reply(answer)
        } catch (err) {
            logger.error('[IA COMMAND ERROR]', err)
            return reply(`❌ *Erro na pesquisa:* ${err.message}`)
        }
    }
}

