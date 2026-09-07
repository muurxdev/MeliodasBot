/**
 * LLM Service — IA em Nuvem de Alta Velocidade para .ia / .explicar / .resumir / .traduzir.
 *
 * Provedores em nuvem (respostas instantâneas em ~1-2s):
 *   1. GEMINI_API_KEY     — Google Gemini 2.0 Flash oficial com Search Grounding opcional.
 *   2. GROQ_API_KEY       — Groq Llama-3.3-70b-versatile ultra-rápido.
 *   3. PERPLEXITY_API_KEY — Sonar com busca em tempo real.
 *   4. CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN — Workers AI.
 *   5. OLLAMA_URL         — Ollama local opcional.
 */

const logger = require('../core/logger')

const TIMEOUT_MS = 25000
const TIMEOUT_LOCAL_MS = 60000

function _cfg() {
    return {
        geminiKey: (process.env.GEMINI_API_KEY || '').trim(),
        geminiModel: (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim(),
        geminiSearchGrounding: String(process.env.GEMINI_SEARCH_GROUNDING || 'true').toLowerCase() !== 'false',
        groqKey: (process.env.GROQ_API_KEY || '').trim(),
        groqModel: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
        perplexityKey: (process.env.PERPLEXITY_API_KEY || '').trim(),
        perplexityModel: (process.env.PERPLEXITY_MODEL || 'sonar').trim(),
        cfAccount: (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
        cfToken: (process.env.CLOUDFLARE_API_TOKEN || '').trim(),
        cfModel: (process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct').trim(),
        ollamaUrl: (process.env.OLLAMA_URL || '').trim().replace(/\/$/, ''),
        ollamaModel: (process.env.OLLAMA_MODEL || 'qwen2.5:3b').trim()
    }
}

/** @returns {boolean} há algum provedor configurado? */
function hasProvider() {
    const c = _cfg()
    return Boolean(c.geminiKey || c.groqKey || c.perplexityKey || (c.cfAccount && c.cfToken) || c.ollamaUrl)
}

/** @returns {string[]} nomes dos provedores ativos (para diagnóstico). */
function providersAtivos() {
    const c = _cfg()
    const l = []
    if (c.geminiKey) l.push(`Google Gemini (${c.geminiModel})`)
    if (c.groqKey) l.push(`Groq (${c.groqModel})`)
    if (c.perplexityKey) l.push(`Perplexity (${c.perplexityModel})`)
    if (c.cfAccount && c.cfToken) l.push(`Cloudflare (${c.cfModel})`)
    if (c.ollamaUrl) l.push(`Ollama local (${c.ollamaModel})`)
    return l
}

async function _fetchJson(url, options, timeoutMs = TIMEOUT_MS) {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), timeoutMs)
    try {
        const res = await fetch(url, { ...options, signal: ctl.signal })
        const texto = await res.text()
        let json = null
        try { json = JSON.parse(texto) } catch (_) { /* resposta não-JSON */ }
        if (!res.ok) {
            const detalhe = (json && (json.error?.message || json.message)) || texto.slice(0, 160)
            throw new Error(`HTTP ${res.status}: ${detalhe}`)
        }
        return json
    } finally {
        clearTimeout(t)
    }
}

async function _groq(prompt, system, c) {
    const json = await _fetchJson('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.groqKey}` },
        body: JSON.stringify({
            model: c.groqModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 1200
        })
    })
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _gemini(prompt, system, c, returnSources = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.geminiModel)}:generateContent?key=${encodeURIComponent(c.geminiKey)}`
    const payload = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1200 }
    }
    if (c.geminiSearchGrounding) {
        payload.tools = [{ googleSearch: {} }]
    }

    let json
    try {
        json = await _fetchJson(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
    } catch (err) {
        // Se a API rejeitar o grounding de busca, refaz sem a ferramenta
        if (payload.tools) {
            delete payload.tools
            json = await _fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
        } else {
            throw err
        }
    }

    const candidate = json?.candidates?.[0]
    const partes = candidate?.content?.parts
    const text = Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() || null : null

    const sources = []
    const chunks = candidate?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
        if (chunk.web?.uri) {
            sources.push({
                title: chunk.web.title || 'Web Search',
                url: chunk.web.uri,
                snippet: ''
            })
        }
    }

    if (returnSources) {
        return { text, sources }
    }
    return text
}

async function _perplexity(prompt, system, c) {
    const json = await _fetchJson('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.perplexityKey}` },
        body: JSON.stringify({
            model: c.perplexityModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1200
        })
    })
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _cloudflare(prompt, system, c) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${c.cfAccount}/ai/run/${c.cfModel}`
    const json = await _fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.cfToken}` },
        body: JSON.stringify({
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            max_tokens: 1000
        })
    })
    return (json?.result?.response || '').trim() || null
}

async function _ollama(prompt, system, c) {
    const json = await _fetchJson(`${c.ollamaUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: c.ollamaModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 500
        })
    }, TIMEOUT_LOCAL_MS)
    return json?.choices?.[0]?.message?.content?.trim() || null
}

const SYSTEM_PADRAO =
    'Você é o Meliodas, assistente virtual inteligente, amigável e descontraído de um bot de WhatsApp brasileiro. ' +
    'Responda SEMPRE em português do Brasil de forma natural, humana, fluida e prestativa. ' +
    'Adapte o tamanho da resposta ao que foi perguntado: seja direto quando a pergunta for simples e explicativo quando necessário. ' +
    'Use parágrafos bem espaçados para facilitar a leitura no WhatsApp e poucos emojis com bom senso. ' +
    'NUNCA cite nomes de fontes, links, buscadores, motores ou mencione termos como "conforme fontes", "pesquisado na web" ou "gerado por IA". ' +
    'Apenas entregue o conteúdo e a resposta de forma direta e excelente.'

/**
 * Pergunta ao primeiro provedor disponível, com fallback em cadeia.
 * @param {string} prompt
 * @param {{system?: string, returnSources?: boolean}} [opts]
 * @returns {Promise<string|{text: string, sources: Array}|null>}
 */
async function ask(prompt, opts = {}) {
    const texto = String(prompt || '').trim()
    if (!texto) return null
    const c = _cfg()
    const system = opts.system || SYSTEM_PADRAO
    const returnSources = Boolean(opts.returnSources)

    const nuvem = []
    if (c.geminiKey) nuvem.push(['Google Gemini', () => _gemini(texto, system, c, returnSources)])
    if (c.groqKey) nuvem.push(['Groq', async () => {
        const text = await _groq(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])
    if (c.perplexityKey) nuvem.push(['Perplexity', async () => {
        const text = await _perplexity(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])
    if (c.cfAccount && c.cfToken) nuvem.push(['Cloudflare', async () => {
        const text = await _cloudflare(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])

    const local = []
    if (c.ollamaUrl) local.push(['Ollama local', async () => {
        const text = await _ollama(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])

    const preferirNuvem = String(process.env.LLM_PREFER_CLOUD || 'true').toLowerCase() !== 'false'
    const cadeia = preferirNuvem ? [...nuvem, ...local] : [...local, ...nuvem]
    if (!cadeia.length) return null

    for (const [nome, fn] of cadeia) {
        try {
            const r = await fn()
            const hasText = returnSources ? (r && r.text) : Boolean(r)
            if (hasText) return r
            logger.warn(`[LLM] ${nome} respondeu vazio; tentando o próximo provedor.`)
        } catch (e) {
            logger.warn(`[LLM] ${nome} falhou: ${e.message}`)
        }
    }
    return null
}

/**
 * Responde uma pergunta APOIADA em informações de apoio, de forma natural.
 * @param {string} pergunta
 * @param {Array<{title?:string, snippet?:string, url?:string}>} resultados
 */
async function askComContexto(pergunta, resultados = []) {
    if (!resultados.length) return ask(pergunta)
    const contexto = resultados.slice(0, 5)
        .map((r, i) => `${r.title ? r.title + ':\n' : ''}${r.snippet || ''}`)
        .join('\n\n')
    const prompt =
        `Pergunta do usuário: ${pergunta}\n\n` +
        `Informações de apoio:\n${contexto}\n\n` +
        `Com base nas informações acima, responda à pergunta do usuário de forma natural, fluida e amigável em português do Brasil. Não mencione fontes, links ou trechos: apenas responda o assunto diretamente.`
    return ask(prompt)
}

/** Tradução via LLM (preserva tom e gírias). */
async function traduzir(texto, idiomaDestino = 'português do Brasil') {
    return ask(`Traduza para ${idiomaDestino}. Devolva APENAS a tradução, sem comentários:\n\n${texto}`, {
        system: 'Você é um tradutor profissional. Devolva somente a tradução direta, preservando o tom do original.'
    })
}

/** Resumo via LLM. */
async function resumir(texto) {
    return ask(`Resuma o texto abaixo de forma clara e coesa em português do Brasil:\n\n${texto}`, {
        system: 'Você é um especialista em síntese de textos. Crie um resumo fiel, fluido e agradável de ler.'
    })
}

module.exports = { hasProvider, providersAtivos, ask, askComContexto, traduzir, resumir }
