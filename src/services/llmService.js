/**
 * LLM Service — IA de verdade para .ia / .explicar / .resumir / .traduzir.
 * LLM Service — IA em Nuvem de Alta Velocidade para .ia / .explicar / .resumir / .traduzir.
 *
 * Provedores, na ORDEM em que são tentados (o primeiro configurado vence; se
 * falhar, cai para o próximo):
 *   1. OLLAMA_URL   — LLM local, 100% open source, sem chave e sem cota. Roda no
 *                     container `meliodas_ollama`. Preferido justamente por não
 *                     depender de ninguém. Contrapartida: a VPS tem 2 vCPUs e
 *                     nenhuma GPU, então modelo pequeno e resposta em ~10-30s.
 *   2. GROQ_API_KEY — 30 req/min, 1.000/dia. Rápido. https://console.groq.com/keys
 *   3. GEMINI_API_KEY — Flash gratuito.      https://aistudio.google.com/apikey
 *   4. CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN — 10k neurons/dia.
 *
 * SEM NENHUM configurado o serviço fica inativo e quem chama cai no comportamento
 * antigo (busca web no DuckDuckGo) — nada quebra.
 * Provedores em nuvem (respostas instantâneas em ~1-2s):
 *   1. GEMINI_API_KEY — Google Gemini 2.0 Flash oficial gratuito com Google Search Grounding.
 *   2. GROQ_API_KEY   — Groq Llama-3.3-70b-versatile ultra-rápido.
 *   3. PERPLEXITY_API_KEY — Sonar com busca em tempo real.
 *   4. CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN — Workers AI.
 */

const logger = require('../core/logger')

const TIMEOUT_MS = 25000
// O LLM local roda em CPU e leva 20-30s; com o timeout padrão ele era cortado
// exatamente no limite. Nuvem continua com o prazo curto.
const TIMEOUT_LOCAL_MS = 75000

function _cfg() {
    return {
        // Ollama LOCAL (open source, sem chave, sem custo).
        ollamaUrl: (process.env.OLLAMA_URL || '').trim().replace(/\/$/, ''),
        ollamaModel: (process.env.OLLAMA_MODEL || 'qwen2.5:3b').trim(),
        geminiKey: (process.env.GEMINI_API_KEY || '').trim(),
        geminiModel: (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim(),
        geminiSearchGrounding: String(process.env.GEMINI_SEARCH_GROUNDING || 'true').toLowerCase() !== 'false',
        groqKey: (process.env.GROQ_API_KEY || '').trim(),
        groqModel: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
        geminiKey: (process.env.GEMINI_API_KEY || '').trim(),
        geminiModel: (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim(),
        geminiSearchGrounding: String(process.env.GEMINI_SEARCH_GROUNDING || 'false').toLowerCase() === 'true',
        perplexityKey: (process.env.PERPLEXITY_API_KEY || '').trim(),
        perplexityModel: (process.env.PERPLEXITY_MODEL || 'sonar').trim(),
        cfAccount: (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
        cfToken: (process.env.CLOUDFLARE_API_TOKEN || '').trim(),
        cfModel: (process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct').trim()
    }
}

/** @returns {boolean} há algum provedor configurado? */
function hasProvider() {
    const c = _cfg()
    return Boolean(c.geminiKey || c.perplexityKey || c.groqKey || c.ollamaUrl || (c.cfAccount && c.cfToken))
    return Boolean(c.geminiKey || c.groqKey || c.perplexityKey || (c.cfAccount && c.cfToken))
}

/** @returns {string[]} nomes dos provedores ativos (para diagnóstico). */
function providersAtivos() {
    const c = _cfg()
    const l = []
    if (c.geminiKey) l.push('Gemini (' + c.geminiModel + ')')
    if (c.geminiKey) l.push('Google Gemini (' + c.geminiModel + ')')
    if (c.groqKey) l.push('Groq (' + c.groqModel + ')')
    if (c.perplexityKey) l.push('Perplexity (' + c.perplexityModel + ')')
    if (c.groqKey) l.push('Groq (' + c.groqModel + ')')
    if (c.cfAccount && c.cfToken) l.push('Cloudflare (' + c.cfModel + ')')
    if (c.ollamaUrl) l.push('Ollama local (' + c.ollamaModel + ')')
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

async function _ollama(prompt, system, c) {
    // Ollama expõe uma API compatível com OpenAI em /v1/chat/completions.
    const json = await _fetchJson(`${c.ollamaUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: c.ollamaModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.3,
            // Resposta curta é resposta rápida: em CPU o custo é por token gerado.
            max_tokens: 320
        })
    }, TIMEOUT_LOCAL_MS)
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _groq(prompt, system, c) {
    const json = await _fetchJson('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.groqKey}` },
        body: JSON.stringify({
            model: c.groqModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 900
        })
    })
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _gemini(prompt, system, c) {
async function _gemini(prompt, system, c, returnSources = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.geminiModel)}:generateContent?key=${encodeURIComponent(c.geminiKey)}`
    const payload = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 900 }
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
        // Se a API rejeitar o grounding de busca (ex: modelo específico), refaz sem a ferramenta
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

    const partes = json?.candidates?.[0]?.content?.parts
    return Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() || null : null
    const candidate = json?.candidates?.[0]
    const partes = candidate?.content?.parts
    const text = Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() || null : null

    // Fontes do Google Grounding
    const sources = []
    const chunks = candidate?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
        if (chunk.web?.uri) {
            sources.push({
                title: chunk.web.title || 'Google Search',
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
            temperature: 0.2,
            max_tokens: 900
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
            max_tokens: 900
        })
    })
    return (json?.result?.response || '').trim() || null
}

const SYSTEM_PADRAO =
    'Você é um assistente de um bot de WhatsApp brasileiro. Responda SEMPRE em português do Brasil, ' +
    'de forma direta e objetiva, em no máximo 8 linhas. Use no máximo 2 emojis. ' +
    'Não invente fatos: se não souber, diga que não sabe. Não use markdown de título (#).'

/**
 * Pergunta ao primeiro provedor disponível, com fallback em cadeia.
 * Pergunta ao primeiro provedor disponível em nuvem, com fallback em cadeia.
 * @param {string} prompt
 * @param {{system?: string}} [opts]
 * @returns {Promise<string|null>} resposta ou null se nenhum provedor respondeu
 * @param {{system?: string, returnSources?: boolean}} [opts]
 * @returns {Promise<string|{text: string, sources: Array}|null>}
 */
async function ask(prompt, opts = {}) {
    const texto = String(prompt || '').trim()
    if (!texto) return null
    const c = _cfg()
    const system = opts.system || SYSTEM_PADRAO
    const returnSources = Boolean(opts.returnSources)

    const local = []
    const nuvem = []
    if (c.geminiKey) nuvem.push(['Gemini', () => _gemini(texto, system, c)])
    if (c.perplexityKey) nuvem.push(['Perplexity', () => _perplexity(texto, system, c)])
    if (c.groqKey) nuvem.push(['Groq', () => _groq(texto, system, c)])
    if (c.cfAccount && c.cfToken) nuvem.push(['Cloudflare', () => _cloudflare(texto, system, c)])
    if (c.ollamaUrl) local.push(['Ollama', () => _ollama(texto, system, c)])
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

    // Padrão: Nuvem primeiro para latência ultra-rápida (~1s vs ~25s do CPU na VPS).
    // Para priorizar Ollama local: defina LLM_PREFER_CLOUD=false no .env.
    const preferirNuvem = String(process.env.LLM_PREFER_CLOUD || 'true').toLowerCase() !== 'false'
    const cadeia = preferirNuvem ? [...nuvem, ...local] : [...local, ...nuvem]
    if (!cadeia.length) return null

    for (const [nome, fn] of cadeia) {
    for (const [nome, fn] of nuvem) {
        try {
            const r = await fn()
            if (r) return r
            const hasText = returnSources ? (r && r.text) : Boolean(r)
            if (hasText) return r
            logger.warn(`[LLM] ${nome} respondeu vazio; tentando o próximo.`)
        } catch (e) {
            logger.warn(`[LLM] ${nome} falhou: ${e.message}`)
        }
    }
    return null
}

/**
 * Responde uma pergunta APOIADA em resultados de busca web (reduz alucinação).
 * @param {string} pergunta
 * @param {Array<{title?:string, snippet?:string, url?:string}>} resultados
 */
async function askComContexto(pergunta, resultados = []) {
    if (!resultados.length) return ask(pergunta)
    const contexto = resultados.slice(0, 5)
        .map((r, i) => `[${i + 1}] ${r.title || ''}\n${r.snippet || ''}\n(${r.url || ''})`)
        .join('\n\n')
    const prompt =
        `Pergunta: ${pergunta}\n\n` +
        `Resultados de busca na web:\n${contexto}\n\n` +
        `Responda à pergunta usando os resultados acima. Se eles não responderem, diga isso claramente.`
    return ask(prompt)
}

/** Tradução via LLM (melhor que endpoint literal p/ gíria e contexto). */
async function traduzir(texto, idiomaDestino = 'português do Brasil') {
    return ask(`Traduza para ${idiomaDestino}. Devolva APENAS a tradução, sem comentários:\n\n${texto}`, {
        system: 'Você é um tradutor profissional. Devolva somente a tradução, preservando o tom do original.'
    })
}

/** Resumo via LLM. */
async function resumir(texto) {
    return ask(`Resuma o texto abaixo em até 5 linhas, em português:\n\n${texto}`, {
        system: 'Você resume textos de forma fiel e objetiva, sem inventar informação.'
    })
}

module.exports = { hasProvider, providersAtivos, ask, askComContexto, traduzir, resumir }
