/**
 * Comando .ia / .gpt / .perguntar / .pesquisar
 * Inteligência Artificial Meliodas — Respostas diretas, naturais e sem disclaimers
 */

const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

function cleanSearchQuery(rawText) {
    if (!rawText || typeof rawText !== 'string') return ''
    return rawText
        .replace(/[╔═╚╭━╰┃⬣_—#`🔍📌✨🤖💡💬]/g, ' ')
        .replace(/\b(RESULTADOS DA WEB|RESULTADOS|Pesquisando e processando|Inteligência|Sobre o Bot|Dossiê|Diagnóstico)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

module.exports = {
    name: 'ia',
    aliases: ['meli', 'meliodasia', 'ai', 'perguntar', 'pesquisar', 'busca', 'google', 'gpt'],
    category: 'general',
    description: 'Responde dúvidas e realiza pesquisas com inteligência artificial natural',
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

        const botName = getBotName()

        if (!query) {
            return reply(`🧠 *MELIODAS IA*\n\nEnvie sua dúvida, conversa ou pesquisa após o comando.\n\n📌 *Exemplos:*\n• \`.ia quem foi Nikola Tesla?\`\n• \`.gpt como funciona um avião?\`\n• \`.ia como você está?\`\n\n💡 *Dica:* Você também pode responder a qualquer mensagem digitando \`.ia\`!`)
        }

        const iaEngine = require('../../services/iaEngine')
        const intencao = iaEngine.detectarIntencao(query)

        // Consultas factuais mais longas podem avisar brevemente; conversas e contas respondem na hora
        if (intencao === 'factual' && query.length > 25) {
            await reply(`🧠 *Processando:* _"${query.slice(0, 50)}"_...`)
        }

        try {
            const r = await iaEngine.responder(query)

            let doc = '╔══════════════════════════════╗\n'
            doc += '║       🧠 *MELIODAS IA* 🧠       ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📌 _"${query.slice(0, 80)}"_\n\n`
            doc += `╭━〔 💡 RESPOSTA 〕━⬣\n${r.texto}\n╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        } catch (err) {
            logger.error('[IA COMMAND ERROR]', err)
            return reply(`❌ *Erro na pesquisa:* ${err.message}`)
        }
    }
}
