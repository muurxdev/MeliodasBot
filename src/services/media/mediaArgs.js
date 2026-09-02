/**
 * MeliodasBot — Utility: Argumentos Centralizados do yt-dlp
 *
 * Garante que todas as chamadas (metadata, download, pesquisa) usem a mesma
 * estratégia de autenticação e robustez:
 *  - Cookies (quando existir data/cookies.txt ou YOUTUBE_COOKIES_FILE)
 *  - Fallback entre múltiplos "player clients" do YouTube (bypass parcial do
 *    bloqueio "Sign in to confirm you're not a bot" de IPs de datacenter)
 */

const fs = require('fs')
const path = require('path')
const { dataDir } = require('../../config/paths')
const logger = require('../../core/logger')

const COOKIES_FILE = process.env.YOUTUBE_COOKIES_FILE
    ? path.resolve(process.env.YOUTUBE_COOKIES_FILE)
    : path.join(dataDir, 'cookies.txt')

/**
 * Caminho dos cookies resolvido em tempo de chamada (lê o env novamente,
 * permitindo testes e mudança de runtime sem recarregar o módulo)
 * @returns {string}
 */
function getCookiesFilePath() {
    return process.env.YOUTUBE_COOKIES_FILE
        ? path.resolve(process.env.YOUTUBE_COOKIES_FILE)
        : path.join(dataDir, 'cookies.txt')
}

const YOUTUBE_CLIENTS = process.env.YOUTUBE_CLIENTS || 'ios,tv,android,default,web_embedded'

// PO Token do YouTube (gerado por ferramentas como yt-dlp-get-pot / bga) ajuda a
// contornar o bloqueio "Sign in to confirm you're not a bot" sem cookies.
const YOUTUBE_PO_TOKEN = process.env.YOUTUBE_PO_TOKEN || ''

const EXTRA_EXTRACTOR_ARGS = process.env.YTDLP_EXTRACTOR_ARGS || ''

// Diretório de plugins do yt-dlp (ex: bgutil-ytdlp-pot-provider) para geração
// dinâmica de PO Tokens (bypass do bloqueio "Sign in to confirm you're not a bot").
const PLUGIN_DIR = process.env.YTDLP_PLUGIN_DIR || '/app/ytdlp_plugins'

// Runtime de JavaScript para o yt-dlp (yt-dlp usa isso para gerar nsig/signatures
// e executar o JS Challenge do YouTube; sem ele, formatos e o "not a bot" falham).
const JS_RUNTIME = process.env.YTDLP_JS_RUNTIME || 'node'

// Endpoint do bgutil PO Token Provider (plugin bgutil-ytdlp-pot-provider).
// O plugin lê PO_TOKEN_PROVIDER do ENV do processo do yt-dlp, não dos args.
const PO_TOKEN_PROVIDER = process.env.PO_TOKEN_PROVIDER || ''

/**
 * Ambiente do processo do yt-dlp: herda o env do bot e injeta as variáveis
 * que o yt-dlp/plugins leem (ex: PO_TOKEN_PROVIDER do bgutil, cookies auto).
 * @returns {Object}
 */
function getYtDlpEnv() {
    const env = { ...process.env }
    if (PO_TOKEN_PROVIDER) env.PO_TOKEN_PROVIDER = PO_TOKEN_PROVIDER
    return env
}

function fileHasCookies(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return false
    try {
        const head = fs.readFileSync(filePath, 'utf8').slice(0, 4000)
        // Netscape / cookies.txt header mínimo OU qualquer linha com domínio real
        return /netscape|http\.only|\.youtube\.com|\.tiktok\.com|\.instagram\.com/i.test(head)
    } catch (_) {
        return false
    }
}

/**
 * Retorna o caminho do arquivo de cookies se existir e for válido
 * @returns {string|null}
 */
function getCookiesPath() {
    if (!fileHasCookies(COOKIES_FILE)) return null
    return COOKIES_FILE
}

/**
 * Valida o arquivo de cookies (formato Netscape exportado por "Get cookies.txt
 * LOCALLY"): precisa existir, ter conteúdo, cabeçalho/domínio YouTube e pelo
 * menos uma linha de cookie bem formada no formato tabulado do Netscape.
 * @returns {{ok: boolean, reason: string, detail?: string, count?: number, domain?: string}}
 */
function validateCookiesFile(filePath = getCookiesFilePath()) {
    if (!filePath || !fs.existsSync(filePath)) {
        return { ok: false, reason: 'AUSENTE', detail: 'crie data/cookies.txt (formato Netscape)' }
    }

    let content = ''
    try {
        const stat = fs.statSync(filePath)
        if (stat.size === 0) {
            return { ok: false, reason: 'VAZIO', detail: 'o arquivo existe mas está vazio' }
        }
        if (stat.size > 2 * 1024 * 1024) {
            return { ok: false, reason: 'GRANDE_DEMAIS', detail: 'máx. 2MB' }
        }
        content = fs.readFileSync(filePath, 'utf8')
    } catch (err) {
        return { ok: false, reason: 'ILEGIVEL', detail: err.message }
    }

    const hasHeader = /netscape|http\.only|# cookies/i.test(content.slice(0, 1000))

    let count = 0
    let domain = null
    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue
        // formato Netscape: domain<TAB>flag<TAB>path<TAB>secure<TAB>expiry<TAB>name<TAB>value
        const cols = line.split('\t')
        if (cols.length < 7) continue
        if (!cols[0] || !cols[2] || !cols[5] || !cols[6]) continue
        count += 1
        if (!domain && (/youtube\.com|tiktok\.com|instagram\.com/i.test(cols[0]))) {
            domain = cols[0]
        }
    }

    if (count === 0) {
        return { ok: false, reason: 'FORMATO_INVALIDO', detail: 'nenhuma linha de cookie Netscape (domínio<TAB>...<TAB>valor) encontrada' }
    }

    if (!hasHeader && !domain) {
        return { ok: false, reason: 'SEM_DOMINIOS_SUPORTADOS', detail: 'sem cookies de youtube/tiktok/instagram' }
    }

    return { ok: true, reason: 'OK', count, domain: domain || 'outro' }
}

/**
 * Constrói os argumentos base comuns a todas as invocações do yt-dlp
 * @param {string[]} [extra] - Argumentos adicionais específicos da chamada
 * @returns {string[]}
 */
function buildYtDlpArgs(extra = []) {
    const args = []

    const cookies = getCookiesPath()
    if (cookies) {
        args.push('--cookies', cookies)
    } else {
        logger.debug('[MEDIA ARGS] Nenhum arquivo de cookies válido encontrado. Usando acesso anônimo.')
    }

    // Plugins opcionais (ex: bgutil PO Token Provider) se presentes na imagem
    if (PLUGIN_DIR && fs.existsSync(PLUGIN_DIR)) {
        args.push('--plugin-dirs', PLUGIN_DIR)
    }

    // Runtime JS (necessário no yt-dlp para gerar assinaturas/nsig e vencer o
    // JS Challenge — sem JS runtime, vídeos com verificação acabam em bot-check)
    if (JS_RUNTIME) {
        args.push('--js-runtimes', JS_RUNTIME)
    }

    // --extractor-args: args do MESMO extrator separados por ';',
    // extractores DIFERENTES separados por ','.
    const extractorGroups = []
    const youtubeArgs = []
    if (YOUTUBE_CLIENTS) youtubeArgs.push(`player_client=${YOUTUBE_CLIENTS}`)
    if (YOUTUBE_PO_TOKEN) youtubeArgs.push(`po_token=${YOUTUBE_PO_TOKEN}`)
    if (youtubeArgs.length > 0) extractorGroups.push(`youtube:${youtubeArgs.join(';')}`)
    if (EXTRA_EXTRACTOR_ARGS) extractorGroups.push(EXTRA_EXTRACTOR_ARGS)

    if (extractorGroups.length > 0) {
        args.push('--extractor-args', extractorGroups.join(','))
    }

    args.push(...extra)

    return args
}

module.exports = {
    COOKIES_FILE,
    YOUTUBE_CLIENTS,
    YOUTUBE_PO_TOKEN,
    PLUGIN_DIR,
    JS_RUNTIME,
    PO_TOKEN_PROVIDER,
    getCookiesFilePath,
    validateCookiesFile,
    getYtDlpEnv,
    getCookiesPath,
    fileHasCookies,
    buildYtDlpArgs
}