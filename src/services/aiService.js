/**
 * AI & Web Search Intelligence Service v3
 * Motor de pesquisa Web em tempo real com fontes verificadas, síntese factual e links oficiais
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { tempDir } = require('../config/paths')
const { getBotName } = require('../config/botConfig')
const logger = require('../core/logger')

/**
 * Pesquisa em tempo real na Web (DuckDuckGo + Google HTML Scraper)
 * Pesquisa em tempo real na Web (Wikipedia API + DuckDuckGo API + HTML Lite)
 * Retorna títulos, snippets e URLs diretas de fontes reais
 * @param {string} query
 * @returns {Promise<Array<{url: string, title: string, snippet: string}>>}
 */
async function searchWeb(query) {
    if (!query || typeof query !== 'string') return []
    const results = []
    const cleanQuery = query.trim()

    // 1. Wikipedia API em Português (respostas factuais instantâneas e sem bloqueio de IP)
    try {
        const wikiUrl = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=4&namespace=0&format=json`
        const res = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'MeliodasBot/2.0 (WhatsApp Assistant; contact@meliodasbot.com)' },
            signal: AbortSignal.timeout(5000)
        })

        if (res.ok) {
            const data = await res.json()
            const titles = data[1] || []
            const snippets = data[2] || []
            const urls = data[3] || []
            for (let i = 0; i < titles.length && results.length < 3; i++) {
                if (urls[i] && snippets[i]) {
                    results.push({
                        title: titles[i],
                        snippet: snippets[i],
                        url: urls[i]
                    })
                }
            }
        }
    } catch (_) {}

    // 2. DuckDuckGo Instant Answer API
    if (results.length < 3) {
        try {
            const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`
            const res = await fetch(ddgApiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                signal: AbortSignal.timeout(5000)
            })
            if (res.ok) {
                const data = await res.json()
                if (data.AbstractText && data.AbstractURL) {
                    results.push({
                        title: data.Heading || cleanQuery,
                        snippet: data.AbstractText,
                        url: data.AbstractURL
                    })
                }
                if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                    for (const topic of data.RelatedTopics) {
                        if (topic.Text && topic.FirstURL && results.length < 4) {
                            results.push({
                                title: topic.Text.slice(0, 50),
                                snippet: topic.Text,
                                url: topic.FirstURL
                            })
                        }
                    }
                }
            }
        } catch (_) {}
    }
    // 3. DuckDuckGo HTML Scraper com headers rotativos como fallback
    if (results.length < 3) {
        try {
            const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(cleanQuery)
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
                },
                signal: AbortSignal.timeout(6000)
            })
            if (res.ok) {
                const html = await res.text()
                const blocks = html.split(/class="result\s+/)
                for (let i = 1; i < blocks.length && results.length < 5; i++) {
                    const block = blocks[i]
                    const urlMatch = block.match(/href="([^"]+)"[^>]*class="result__url"/i) || block.match(/class="result__url"[^>]*href="([^"]+)"/i) || block.match(/href="([^"]+)"/i)
                    const titleMatch = block.match(/class="result__title"[^>]*>([\s\S]*?)<\/h2>/i) || block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/i)
                    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i) || block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/span>/i)

                    if (urlMatch && (titleMatch || snippetMatch)) {
                        let u = urlMatch[1]
                        try {
                            const parsed = new URL(u, 'https://duckduckgo.com')
                            if (parsed.searchParams.has('uddg')) u = decodeURIComponent(parsed.searchParams.get('uddg'))
                        } catch (_) {}

                        const clean = (str) => (str || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim()
                        const title = clean(titleMatch ? titleMatch[1] : '')
                        const snippet = clean(snippetMatch ? snippetMatch[1] : '')

                        if (snippet && !u.includes('duckduckgo.com') && !u.includes('y.js')) {
                            results.push({ url: u, title: title || 'Fonte Web', snippet })
                        }
                    }
                }
            }
        } catch (err) {
            logger.warn(`[SEARCH WEB WARN] ${err.message}`)
        }
    }

    return results
}

/**
 * Síntese inteligente de resposta a partir de pesquisa na Web com fontes reais
 * Síntese inteligente de resposta a partir de IA Google com Search Grounding e fontes reais
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAI(prompt) {
    const cleanPrompt = String(prompt || '').trim()
    const botName = getBotName()

    if (!cleanPrompt) {
        return `🤖 Olá! Sou o *${botName}*.\n\nComo posso ajudar? Você pode me fazer perguntas sobre qualquer assunto, notícias, ciência ou pesquisar na web em tempo real!\n\n📌 *Exemplo:* \`.ia quem descobriu o brasil data\``
    }

    const lower = cleanPrompt.toLowerCase()

    // A. Resposta direta sobre o Bot / Sistema
    if (
        lower.includes('esse chatbot') ||
        lower.includes('este chatbot') ||
        lower.includes('este bot') ||
        lower.includes('esse bot') ||
        lower.includes('o bot funciona') ||
        lower.includes('como você funciona') ||
        lower.includes('quem te criou') ||
        lower.includes('quem é você') ||
        lower.includes('sobre o bot')
    ) {
        let card = `╔══════════════════════════════╗\n`
        card += `║    🤖 *SOBRE O ${botName}* 🤖    ║\n`
        card += `╚══════════════════════════════╝\n\n`
        card += `✨ *Olá! Sou o ${botName}*, um assistente e sistema modular completo para WhatsApp.\n\n`
        card += `╭━〔 ⚙️ ARQUITETURA & TECNOLOGIA 〕━⬣\n`
        card += `┃ 🧠 *Linguagem:* Node.js moderno de alta performance\n`
        card += `┃ 🌐 *Bot:* ${botName}\n`
        card += `┃ 🗄️ *Banco de Dados:* SQLite WAL (100% Persistente e Atômico)\n`
        card += `┃ 📦 *Módulos:* 200+ comandos em 14 categorias\n`
        card += `┃ 📦 *Módulos:* 2000 comandos em 16 categorias\n`
        card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        card += `╭━〔 🌟 PRINCIPAIS FUNCIONALIDADES 〕━⬣\n`
        card += `┃ ⚔️ *RPG & Combates:* Classes, Caça, Duelos, Bosses e Guildas\n`
        card += `┃ ⚔️ *RPG Nanatsu no Taizai:* 500 comandos, Clãs, Mandamentos e Forja\n`
        card += `┃ 📥 *Media Hub HD:* Downloads de Spotify, Kwai, TikTok, YouTube, Insta, X\n`
        card += `┃ 🏆 *Economia & Níveis:* Sistema de XP infinito, Carteira, Cassino\n`
        card += `┃ 🛡️ *Moderação:* Anti-Link, Warnings, Banimento e Aluguel\n`
        card += `┃ 🔍 *Pesquisa & IA:* Web Search em tempo real com fontes verificadas\n`
        card += `┃ 🔍 *Pesquisa & IA:* Google Search Grounding em tempo real com fontes verificadas\n`
        card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        card += `👑 *Dono:* ${botName}\n`
        card += `💡 _Digite_ \`.menu\` _para navegar por todos os comandos!_`
        return card
    }

    try {
        // B. Pesquisa Web em tempo real prioritária (com fontes reais e verificadas)
        const llm = require('./llmService')

        // 1. Prioridade Máxima: Google Gemini com Search Grounding em tempo real
        if (llm.hasProvider()) {
            try {
                const aiResult = await llm.ask(cleanPrompt, { returnSources: true })
                const text = typeof aiResult === 'object' ? aiResult?.text : aiResult
                const sources = typeof aiResult === 'object' ? (aiResult?.sources || []) : []

                if (text && text.trim()) {
                    let doc = `╔══════════════════════════════╗\n`
                    doc += `║   🧠 *PESQUISA & INTELIGÊNCIA* 🧠   ║\n`
                    doc += `╚══════════════════════════════╝\n\n`
                    doc += `📌 *Pesquisa:* _"${cleanPrompt}"_\n\n`
                    doc += `╭━〔 💡 RESPOSTA SINTETIZADA 〕━⬣\n`
                    doc += `📝 ${text.trim()}\n`
                    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

                    if (sources.length > 0) {
                        doc += `╭━〔 🌐 FONTES & REFERÊNCIAS REAIS 〕━⬣\n`
                        sources.slice(0, 3).forEach((item, i) => {
                            doc += `┃ ${i + 1}. *${item.title.slice(0, 50)}*\n`
                            doc += `┃    🔗 ${item.url}\n`
                        })
                        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
                    }

                    doc += `✨ _Informações pesquisadas em tempo real na Web._\n`
                    doc += `👑 *${botName}*`
                    return doc.trim()
                }
            } catch (llmErr) {
                logger.warn(`[AI SERVICE] Falha primária no LLM: ${llmErr.message}`)
            }
        }

        // 2. Fallback: Pesquisa Web em tempo real (Wikipedia + DuckDuckGo)
        const webResults = await searchWeb(cleanPrompt)

        if (webResults && webResults.length > 0) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🧠 *PESQUISA & INTELIGÊNCIA* 🧠   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Pesquisa:* _"${cleanPrompt}"_\n\n`

            // Síntese: se houver uma IA configurada (Groq/Gemini/Cloudflare), ela
            // LÊ os resultados e responde de fato. Sem chave, mantém o antigo —
            // que só copiava o trecho do 1º resultado, muitas vezes sem responder.
            const primary = webResults[0]
            let sintese = null
            try {
                const llm = require('./llmService')
                if (llm.hasProvider()) sintese = await llm.askComContexto(cleanPrompt, webResults)
            } catch (e) {
                logger.warn(`[IA] Falha na síntese por LLM: ${e.message}`)
            }

            doc += `╭━〔 💡 RESPOSTA SINTETIZADA 〕━⬣\n`
            doc += `📝 ${sintese || primary.snippet}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            // Fontes e referências reais adicionais
            doc += `╭━〔 🌐 FONTES & REFERÊNCIAS REAIS 〕━⬣\n`
            webResults.slice(0, 3).forEach((item, i) => {
                doc += `┃ ${i + 1}. *${item.title.slice(0, 50)}*\n`
                doc += `┃    🔗 ${item.url}\n`
                if (i < 2 && item !== primary) {
                    doc += `┃    💬 _"${item.snippet.slice(0, 100)}..."_\n`
                }
            })
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `✨ _Informações pesquisadas em tempo real na Web._\n`
            doc += `👑 *${botName}*`
            return doc.trim()
        }

        return `🤖 *${botName} Inteligência:*\n\nNão foi possível obter respostas atualizadas para _"${cleanPrompt}"_ no momento. Tente pesquisar com termos mais diretos (ex: \`.ia quem foi Santos Dumont\`)!`
    } catch (err) {
        logger.error('[AI SERVICE ERROR]', err)
        return `❌ *Erro ao processar pesquisa:* ${err.message}`
    }
}

/**
 * Síntese de voz (TTS em Português)
 * @param {string} text
 * @returns {Promise<string>}
 */
async function generateTTS(text) {
    const cleanText = String(text).slice(0, 200).trim()
    if (!cleanText) throw new Error('Texto inválido para síntese de voz.')

    const audioDir = path.join(tempDir, 'tts')
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true })
    }

    const outPath = path.join(audioDir, `tts_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=${encodeURIComponent(cleanText)}`

    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Falha no TTS (HTTP ${res.statusCode})`))
            }
            const stream = fs.createWriteStream(outPath)
            res.pipe(stream)
            stream.on('finish', () => resolve(outPath))
            stream.on('error', reject)
        }).on('error', reject)
    })
}

module.exports = {
    searchWeb,
    askAI,
    generateTTS
}
