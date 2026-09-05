/**
 * LLM Service — IA de verdade para .ia / .explicar / .resumir / .traduzir.
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
 */

const logger = require('../core/logger')

const TIMEOUT_MS = 25000
// O LLM local roda em CPU e leva 20-30s; com o timeout padrão ele era cortado
// exatamente no limite. Nuvem continua com o prazo curto.
const TIMEOUT_LOCAL_MS = 75000

function _cfg() {
    return {
        // Ollama LOCAL (open source, sem chave, sem custo). Tem prioridade quando
        // configurado: roda no próprio servidor, então não gasta cota de nada.
        ollamaUrl: (process.env.OLLAMA_URL || '').trim().replace(/\/$/, ''),
        ollamaModel: (process.env.OLLAMA_MODEL || 'qwen2.5:3b').trim(),
        groqKey: (process.env.GROQ_API_KEY || '').trim(),
        groqModel: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
        geminiKey: (process.env.GEMINI_API_KEY || '').trim(),
        geminiModel: (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim(),
        cfAccount: (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
        cfToken: (process.env.CLOUDFLARE_API_TOKEN || '').trim(),
        cfModel: (process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct').trim()
    }
}

/** @returns {boolean} há algum provedor configurado? */
function hasProvider() {
    const c = _cfg()
    return Boolean(c.ollamaUrl || c.groqKey || c.geminiKey || (c.cfAccount && c.cfToken))
}

/** @returns {string[]} nomes dos provedores ativos (para diagnóstico). */
function providersAtivos() {
    const c = _cfg()
    const l = []
    if (c.ollamaUrl) l.push('Ollama local (' + c.ollamaModel + ')')
    if (c.groqKey) l.push('Groq (' + c.groqModel + ')')
    if (c.geminiKey) l.push('Gemini (' + c.geminiModel + ')')
    if (c.cfAccount && c.cfToken) l.push('Cloudflare (' + c.cfModel + ')')
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.geminiModel)}:generateContent?key=${encodeURIComponent(c.geminiKey)}`
    const json = await _fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 900 }
        })
    })
    const partes = json?.candidates?.[0]?.content?.parts
    return Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() || null : null
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
 * @param {string} prompt
 * @param {{system?: string}} [opts]
 * @returns {Promise<string|null>} resposta ou null se nenhum provedor respondeu
 */
async function ask(prompt, opts = {}) {
    const texto = String(prompt || '').trim()
    if (!texto) return null
    const c = _cfg()
    const system = opts.system || SYSTEM_PADRAO

    const local = []
    const nuvem = []
    if (c.ollamaUrl) local.push(['Ollama', () => _ollama(texto, system, c)])
    if (c.groqKey) nuvem.push(['Groq', () => _groq(texto, system, c)])
    if (c.geminiKey) nuvem.push(['Gemini', () => _gemini(texto, system, c)])
    if (c.cfAccount && c.cfToken) nuvem.push(['Cloudflare', () => _cloudflare(texto, system, c)])

    // Padrão: LOCAL primeiro (open source, sem cota, sem depender de ninguém).
    // LLM_PREFER_CLOUD=true inverte, para quando quiser velocidade e já tiver
    // uma chave gratuita configurada — a nuvem responde em ~1s contra ~20s do local.
    const preferirNuvem = String(process.env.LLM_PREFER_CLOUD || '').toLowerCase() === 'true'
    const cadeia = preferirNuvem ? [...nuvem, ...local] : [...local, ...nuvem]
    if (!cadeia.length) return null

    for (const [nome, fn] of cadeia) {
        try {
            const r = await fn()
            if (r) return r
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
