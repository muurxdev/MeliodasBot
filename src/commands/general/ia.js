/**
 * Comando .ia / .search
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
    aliases: ['meli', 'meliodasia', 'ai', 'perguntar', 'pesquisar', 'busca', 'google', 'gpt'],
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
            return reply('🧠 *MELIODAS AI & PESQUISA*\n\nEnvie sua dúvida ou termo de pesquisa após o comando.\n\n📌 *Exemplos:*\n• \`.ia quem é Nikola Tesla?\`\n• \`.search últimas notícias sobre astronomia\`\n• \`.gpt como funciona o Node.js no backend?\`\n\n💡 *Dica:* Você também pode responder a qualquer mensagem digitando \`.ia\`!')
        }

        const iaEngine = require('../../services/iaEngine')

        // Conta e cache respondem na hora — não faz sentido dizer "aguarde".
        const intencao = iaEngine.detectarIntencao(query)
        if (intencao !== 'conta') {
            await reply(`🧠 *Pesquisando e processando:* _"${query.slice(0, 50)}"_... Aguarde.`)
        }

        try {
            const r = await iaEngine.responder(query)

            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🧠 *MELIODAS IA & PESQUISA* 🧠   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📌 _"${query.slice(0, 80)}"_\n\n`
            doc += `╭━〔 💡 RESPOSTA 〕━⬣\n${r.texto}\n╰━━━━━━━━━━━━━━━━━━⬣\n`

            if (r.fontes && r.fontes.length) {
                doc += '\n╭━〔 🌐 FONTES 〕━⬣\n'
                r.fontes.slice(0, 3).forEach((f, i) => {
                    doc += `┃ ${i + 1}. ${(f.title || 'Fonte').slice(0, 48)}\n┃    🔗 ${f.url}\n`
                })
                doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
            }

            // Transparência: de onde veio a resposta. Evita passar por "IA sabe tudo"
            // uma resposta que na verdade é cálculo local ou cópia de busca.
            const rotulo = {
                'calculo-local': '🧮 Cálculo exato (sem IA)',
                'ia-ancorada': '🔒 IA ancorada nas fontes acima',
                'ia-traducao': '🌐 Tradução por IA',
                'ia-resumo': '📝 Resumo por IA',
                'busca-web': '🌐 Busca web (sem IA configurada)',
                'sem-fonte': '⚠️ Nenhuma fonte encontrada',
                'fonte-insuficiente': '⚠️ Fontes não responderam'
            }[r.origem] || r.origem
            doc += `\n🔎 _${rotulo}${r.doCache ? ' · resposta em cache' : ''}_`
            doc += `\n⚙️ _Motor: ${iaEngine.motorAtual()}_`

            return reply(doc.trim())
        } catch (err) {
            logger.error('[IA COMMAND ERROR]', err)
            return reply(`❌ *Erro na pesquisa:* ${err.message}`)
        }
    }
}

