/**
 * Motor de IA do bot — anti-alucinação, com cache e roteamento por intenção.
 *
 * O PROBLEMA MEDIDO: o modelo local (qwen2.5:3b) respondendo de memória inventou
 * que "Nanatsu no Taizai" era sobre casamentos temporários. O MESMO modelo, com
 * os resultados da busca no prompt, acertou. Conclusão: a alucinação não se
 * resolve treinando (fine-tuning ensina estilo, não fato — e exigiria GPU),
 * resolve-se PROIBINDO a resposta de memória.
 *
 * Três camadas:
 *
 *  1. ROTEAMENTO POR INTENÇÃO — nem toda pergunta precisa de IA nem de busca.
 *     Conta local é resolvida na hora (0ms, exato); tradução/resumo não precisam
 *     de busca; só o que é FACTUAL vai para a web. Isso é o que deixa rápido.
 *
 *  2. ANCORAGEM OBRIGATÓRIA — para pergunta factual, a resposta é construída
 *     SOMENTE a partir dos trechos buscados, e o modelo é instruído a admitir
 *     quando as fontes não respondem. Sem fonte, sem resposta inventada.
 *
 *  3. CACHE — a mesma pergunta não paga o custo duas vezes. No local isso troca
 *     ~20s por ~0ms, e é o ganho de velocidade mais real que existe aqui.
 */

const logger = require('../core/logger')

const CACHE_TTL_MS = 30 * 60 * 1000   // 30 min
const CACHE_MAX = 300
const _cache = new Map()               // chave -> { resposta, at }

function _cacheGet(chave) {
    const hit = _cache.get(chave)
    if (!hit) return null
    if (Date.now() - hit.at > CACHE_TTL_MS) { _cache.delete(chave); return null }
    // renova a posição (LRU aproximado)
    _cache.delete(chave); _cache.set(chave, hit)
    return hit.resposta
}

function _cacheSet(chave, resposta) {
    if (_cache.size >= CACHE_MAX) _cache.delete(_cache.keys().next().value)
    _cache.set(chave, { resposta, at: Date.now() })
}

const _norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/**
 * Descobre o que o usuário quer, para não gastar busca nem IA à toa.
 * @returns {'conta'|'traducao'|'resumo'|'factual'}
 */
function detectarIntencao(pergunta) {
    const p = _norm(pergunta)
    if (/^[\d\s+\-*/%^().,]+$/.test(p) && /[\d]/.test(p)) return 'conta'
    if (/^(traduz|traduza|traduzir|translate)\b/.test(p)) return 'traducao'
    if (/^(resuma|resumir|resumo de)\b/.test(p)) return 'resumo'
    return 'factual'
}

/** Avalia expressão aritmética simples com segurança (sem eval). */
function calcular(expr) {
    const limpo = String(expr).replace(/[^0-9+\-*/%^().,\s]/g, '').replace(/,/g, '.').replace(/\^/g, '**')
    if (!limpo.trim()) return null
    try {
        // Function é seguro aqui: a string já foi reduzida a dígitos e operadores.
        const r = Function(`"use strict"; return (${limpo})`)()
        return Number.isFinite(r) ? r : null
    } catch (_) { return null }
}

const SYSTEM_ANCORADO =
    'Você responde perguntas usando EXCLUSIVAMENTE os trechos de fonte fornecidos. ' +
    'Regras obrigatórias:\n' +
    '1. NUNCA use conhecimento próprio. Se a resposta não estiver nos trechos, responda exatamente: NAO_ENCONTRADO\n' +
    '2. Não invente nomes, datas, números ou fatos que não apareçam nos trechos.\n' +
    '3. Responda em português do Brasil, direto, em no máximo 6 linhas.\n' +
    '4. Sem markdown de título e no máximo 1 emoji.'

/**
 * Responde uma pergunta factual ANCORADA na web.
 * @returns {Promise<{texto:string, fontes:Array, origem:string, doCache:boolean}|null>}
 */
async function responderFactual(pergunta) {
    const chave = 'f:' + _norm(pergunta)
    const emCache = _cacheGet(chave)
    if (emCache) return { ...emCache, doCache: true }

    const { searchWeb } = require('./aiService')
    const llm = require('./llmService')

    let fontes = []
    try { fontes = (await searchWeb(pergunta)) || [] } catch (e) {
        logger.warn(`[IA ENGINE] Busca falhou: ${e.message}`)
    }

    // Sem IA configurada: devolve as fontes cruas (comportamento antigo, honesto).
    if (!llm.hasProvider()) {
        if (!fontes.length) return null
        return { texto: fontes[0].snippet || '', fontes, origem: 'busca-web', doCache: false }
    }

    // Sem fontes NÃO perguntamos ao modelo: é exatamente aí que ele inventa.
    if (!fontes.length) {
        return {
            texto: 'Não encontrei fontes confiáveis sobre isso agora. Tente reformular com termos mais específicos.',
            fontes: [], origem: 'sem-fonte', doCache: false
        }
    }

    const contexto = fontes.slice(0, 5)
        .map((f, i) => `[${i + 1}] ${f.title || ''}\n${(f.snippet || '').slice(0, 400)}`)
        .join('\n\n')

    const resposta = await llm.ask(
        `TRECHOS DE FONTE:\n${contexto}\n\nPERGUNTA: ${pergunta}\n\nResponda usando apenas os trechos acima.`,
        { system: SYSTEM_ANCORADO }
    )

    if (!resposta || /NAO_ENCONTRADO/i.test(resposta)) {
        // O modelo admitiu que as fontes não respondem — melhor isso do que inventar.
        return {
            texto: 'As fontes que encontrei não respondem isso de forma clara. Veja os links abaixo e tente uma pergunta mais específica.',
            fontes, origem: 'fonte-insuficiente', doCache: false
        }
    }

    const saida = { texto: resposta, fontes, origem: 'ia-ancorada' }
    _cacheSet(chave, saida)
    return { ...saida, doCache: false }
}

/**
 * Ponto de entrada único do .ia — roteia e devolve a resposta pronta.
 * @returns {Promise<{texto:string, fontes:Array, origem:string, doCache:boolean}>}
 */
async function responder(pergunta) {
    const q = String(pergunta || '').trim()
    if (!q) return { texto: 'Faça uma pergunta.', fontes: [], origem: 'vazio', doCache: false }

    const intencao = detectarIntencao(q)

    // Conta: exata e instantânea, sem IA nenhuma.
    if (intencao === 'conta') {
        const r = calcular(q)
        if (r !== null) {
            return { texto: `${q.trim()} = *${r.toLocaleString('pt-BR')}*`, fontes: [], origem: 'calculo-local', doCache: false }
        }
    }

    const llm = require('./llmService')

    // Tradução e resumo não precisam de busca — ir à web só atrasaria.
    if (intencao === 'traducao' && llm.hasProvider()) {
        const alvo = q.replace(/^(traduz(a|ir)?|translate)\s*/i, '')
        const r = await llm.traduzir(alvo)
        if (r) return { texto: r, fontes: [], origem: 'ia-traducao', doCache: false }
    }
    if (intencao === 'resumo' && llm.hasProvider()) {
        const alvo = q.replace(/^(resuma|resumir|resumo de)\s*/i, '')
        const r = await llm.resumir(alvo)
        if (r) return { texto: r, fontes: [], origem: 'ia-resumo', doCache: false }
    }

    const factual = await responderFactual(q)
    return factual || { texto: 'Não consegui pesquisar isso agora. Tente novamente em instantes.', fontes: [], origem: 'erro', doCache: false }
}

/** Rótulo do motor que respondeu, para exibir com transparência. */
function motorAtual() {
    const llm = require('./llmService')
    const ativos = llm.providersAtivos()
    return ativos.length ? ativos[0] : 'Busca web (sem IA configurada)'
}

function limparCache() { _cache.clear() }

module.exports = { responder, responderFactual, detectarIntencao, calcular, motorAtual, limparCache }
