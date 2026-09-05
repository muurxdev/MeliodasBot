/**
 * Utility: Argumentos Centralizados do yt-dlp
 *
 * Garante que todas as chamadas (metadata, download, pesquisa) usem a mesma
 * estratégia de autenticação e robustez:
 *  - Cookies por usuário (data/cookies/<jid>.txt) quando disponível
 *  - Fallback para cookies globais (data/cookies.txt ou YOUTUBE_COOKIES_FILE)
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

const COOKIES_DIR = path.join(dataDir, 'cookies')

if (!fs.existsSync(COOKIES_DIR)) {
    try { fs.mkdirSync(COOKIES_DIR, { recursive: true }) } catch (_) {}
}

function sanitizeJid(jid) {
    if (!jid || typeof jid !== 'string') return ''
    return jid.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_')
}

function getCookiesFilePath() {
    return process.env.YOUTUBE_COOKIES_FILE
        ? path.resolve(process.env.YOUTUBE_COOKIES_FILE)
        : path.join(dataDir, 'cookies.txt')
}

function getCookiesPathFor(userJid) {
    if (userJid) {
        const safeName = sanitizeJid(userJid)
        if (safeName) {
            const userPath = path.join(COOKIES_DIR, `${safeName}.txt`)
            if (fileHasCookies(userPath)) {
                logger.debug(`[MEDIA ARGS] Usando cookies do usuário: ${safeName}`)
                return userPath
            }
        }
    }
    if (!fileHasCookies(COOKIES_FILE)) return null
    return COOKIES_FILE
}

function getCookiesPath() {
    return getCookiesPathFor(null)
}

const YOUTUBE_CLIENTS = process.env.YOUTUBE_CLIENTS || 'ios,tv,android,default,web_embedded'
const YOUTUBE_PO_TOKEN = process.env.YOUTUBE_PO_TOKEN || ''
const EXTRA_EXTRACTOR_ARGS = process.env.YTDLP_EXTRACTOR_ARGS || ''
const PLUGIN_DIR = process.env.YTDLP_PLUGIN_DIR || '/app/ytdlp_plugins'
const JS_RUNTIME = process.env.YTDLP_JS_RUNTIME || 'node'
const PO_TOKEN_PROVIDER = process.env.PO_TOKEN_PROVIDER || ''

function getYtDlpEnv() {
    const env = { ...process.env }
    if (PO_TOKEN_PROVIDER) env.PO_TOKEN_PROVIDER = PO_TOKEN_PROVIDER
    return env
}

function fileHasCookies(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return false
    try {
        const head = fs.readFileSync(filePath, 'utf8').slice(0, 4000)
        return /netscape|http\.only|\.youtube\.com|\.tiktok\.com|\.instagram\.com/i.test(head)
    } catch (_) {
        return false
    }
}

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
    // Um arquivo Netscape pode conter VÁRIOS domínios — é o caso normal quando se
    // exporta YouTube + Instagram juntos. Antes só o primeiro era reportado, o que
    // escondia os demais no status do `.cookies`.
    const dominios = new Set()
    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue
        const cols = line.split('\t')
        if (cols.length < 7) continue
        if (!cols[0] || !cols[2] || !cols[5] || !cols[6]) continue
        count += 1
        const m = String(cols[0]).match(/(youtube|tiktok|instagram|facebook|twitter|x)\.com/i)
        if (m) {
            dominios.add(m[1].toLowerCase())
            if (!domain) domain = cols[0]
        }
    }

    if (count === 0) {
        return { ok: false, reason: 'FORMATO_INVALIDO', detail: 'nenhuma linha de cookie Netscape (domínio<TAB>...<TAB>valor) encontrada' }
    }

    if (!hasHeader && !domain) {
        return { ok: false, reason: 'SEM_DOMINIOS_SUPORTADOS', detail: 'sem cookies de youtube/tiktok/instagram' }
    }

    return {
        ok: true,
        reason: 'OK',
        count,
        domain: domain || 'outro',
        // Lista legível de todas as plataformas presentes no arquivo.
        dominios: [...dominios],
        resumoDominios: dominios.size ? [...dominios].join(', ') : 'outro'
    }
}

function buildYtDlpArgs(extra = [], opts = {}) {
    const args = []

    const cookies = getCookiesPathFor(opts.userJid)
    if (cookies) {
        args.push('--cookies', cookies)
    } else {
        logger.debug('[MEDIA ARGS] Nenhum arquivo de cookies válido encontrado. Usando acesso anônimo.')
    }

    if (PLUGIN_DIR && fs.existsSync(PLUGIN_DIR)) {
        args.push('--plugin-dirs', PLUGIN_DIR)
    }

    if (JS_RUNTIME) {
        args.push('--js-runtimes', JS_RUNTIME)
    }

    args.push('--remote-components', 'ejs:github')

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

function saveUserCookies(userJid, content) {
    if (!userJid || !content || typeof content !== 'string') return false
    const safeName = sanitizeJid(userJid)
    if (!safeName) return false
    try {
        const filePath = path.join(COOKIES_DIR, `${safeName}.txt`)
        fs.writeFileSync(filePath, content, 'utf8')
        logger.info(`[MEDIA ARGS] Cookies do usuário ${safeName} salvos com sucesso.`)
        return true
    } catch (err) {
        logger.error(`[MEDIA ARGS] Erro ao salvar cookies do usuário ${safeName}: ${err.message}`)
        return false
    }
}

function removeUserCookies(userJid) {
    if (!userJid) return false
    const safeName = sanitizeJid(userJid)
    if (!safeName) return false
    try {
        const filePath = path.join(COOKIES_DIR, `${safeName}.txt`)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            logger.info(`[MEDIA ARGS] Cookies do usuário ${safeName} removidos.`)
            return true
        }
        return false
    } catch (err) {
        logger.error(`[MEDIA ARGS] Erro ao remover cookies do usuário ${safeName}: ${err.message}`)
        return false
    }
}

function getCookieStatus(userJid) {
    const global = validateCookiesFile(COOKIES_FILE)
    let user = null
    if (userJid) {
        const safeName = sanitizeJid(userJid)
        const userPath = path.join(COOKIES_DIR, `${safeName}.txt`)
        user = validateCookiesFile(userPath)
    }
    const activePath = getCookiesPathFor(userJid)
    return { global, user, activePath, activeSource: activePath === COOKIES_FILE ? 'global' : 'user' }
}

module.exports = {
    COOKIES_FILE,
    COOKIES_DIR,
    YOUTUBE_CLIENTS,
    YOUTUBE_PO_TOKEN,
    PLUGIN_DIR,
    JS_RUNTIME,
    PO_TOKEN_PROVIDER,
    getCookiesFilePath,
    getCookiesPathFor,
    validateCookiesFile,
    getYtDlpEnv,
    getCookiesPath,
    fileHasCookies,
    buildYtDlpArgs,
    saveUserCookies,
    removeUserCookies,
    getCookieStatus,
    sanitizeJid
}
