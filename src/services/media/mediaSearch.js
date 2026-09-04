/**
 * Media Search Service
 */

const { spawn } = require('child_process')
const { MEDIA_ERRORS, MEDIA_LIMITS, PLATFORMS } = require('./constants')
const { buildYtDlpArgs, getYtDlpEnv } = require('./mediaArgs')
const { toMessage, isMissingBinary } = require('./mediaErrors')
const logger = require('../../core/logger')

/**
 * Pesquisa faixas e vídeos no YouTube retornando uma lista de resultados estruturada
 * @param {string} query - Termo de busca
 * @param {object} options
 * @param {number} [options.limit=5]
 * @param {number} [options.timeoutMs=20000]
 * @returns {Promise<Array<object>>}
 */
async function searchMedia(query, { limit = MEDIA_LIMITS.SEARCH_LIMIT, timeoutMs = 25000, userJid = null } = {}) {
    if (!query || typeof query !== 'string' || !query.trim()) {
        const err = new Error('Termo de pesquisa inválido.')
        err.code = MEDIA_ERRORS.SEARCH_FAILED
        throw err
    }

    const cleanQuery = query.replace(/[`$\";&|<>]/g, '').trim()
    const safeLimit = Math.max(1, Math.min(10, limit))

    // 1. Busca via yt-search (endpoint público — NÃO sofre o bot-check do
    //    "Sign in to confirm you're not a bot" que o `yt-dlp ytsearch` leva).
    //    Só o DOWNLOAD do link resolvido usa yt-dlp (esse funciona com cookies).
    try {
        const yts = require('yt-search')
        const res = await yts(cleanQuery)
        const vids = (res && Array.isArray(res.videos)) ? res.videos.slice(0, safeLimit) : []
        if (vids.length > 0) {
            return vids.map((v, idx) => ({
                id: v.videoId || `search_${idx}`,
                index: idx + 1,
                title: v.title || 'Sem título',
                author: (v.author && v.author.name) || 'Desconhecido',
                duration: v.seconds || 0,
                durationFormatted: v.timestamp || formatDuration(v.seconds || 0),
                thumbnail: v.thumbnail || v.image || null,
                url: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
                platform: PLATFORMS.YOUTUBE,
                type: 'audio'
            }))
        }
        logger.warn('[MEDIA SEARCH] yt-search sem resultados; tentando yt-dlp ytsearch...')
    } catch (e) {
        logger.warn(`[MEDIA SEARCH] yt-search falhou (${e.message}); fallback yt-dlp ytsearch...`)
    }

    // 2. Fallback: yt-dlp ytsearch (pode cair no bot-check em IP de datacenter).
    return ytdlpSearch(cleanQuery, safeLimit, timeoutMs, userJid)
}

function ytdlpSearch(cleanQuery, safeLimit, timeoutMs, userJid) {
    return new Promise((resolve, reject) => {
        const args = buildYtDlpArgs([
            '--dump-single-json',
            '--no-warnings',
            '--no-playlist',
            '--skip-download',
            `ytsearch${safeLimit}:${cleanQuery}`
        ], { userJid })

        let proc
        try {
            proc = spawn('yt-dlp', args, { env: getYtDlpEnv() })
        } catch (spawnErr) {
            const err = new Error(`Falha ao iniciar o yt-dlp: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            return reject(err)
        }
        let stdoutData = ''
        let stderrData = ''

        proc.on('error', spawnErr => {
            clearTimeout(timer)
            logger.error(`[MEDIA SEARCH] Falha ao iniciar yt-dlp: ${spawnErr.message}`)
            const err = new Error(isMissingBinary(spawnErr)
                ? 'yt-dlp não encontrado no ambiente (PATH do processo).'
                : `Falha ao iniciar yt-dlp: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            reject(err)
        })

        proc.stdout.on('data', chunk => {
            stdoutData += chunk.toString()
        })

        proc.stderr.on('data', chunk => {
            stderrData += chunk.toString()
        })

        const timer = setTimeout(() => {
            proc.kill()
            const err = new Error('Tempo limite de pesquisa excedido.')
            err.code = MEDIA_ERRORS.TIMEOUT
            reject(err)
        }, timeoutMs)

        proc.on('close', code => {
            clearTimeout(timer)
            if (code !== 0 || !stdoutData.trim()) {
                logger.warn(`[MEDIA SEARCH] Falha na pesquisa (código ${code}, signal=${proc.signalCode || 'null'}): ${stderrData || 'sem stderr'}`)
                const err = new Error(toMessage('Nenhum resultado encontrado para a busca informada.', stderrData))
                err.code = MEDIA_ERRORS.NO_RESULTS
                return reject(err)
            }

            try {
                const info = JSON.parse(stdoutData)
                const entries = info.entries || [info]

                if (!entries || entries.length === 0 || !entries[0]) {
                    const err = new Error('Nenhum resultado retornado.')
                    err.code = MEDIA_ERRORS.NO_RESULTS
                    return reject(err)
                }

                const results = entries.map((entry, idx) => ({
                    id: entry.id || `search_${idx}`,
                    index: idx + 1,
                    title: entry.title || 'Sem título',
                    author: entry.uploader || entry.channel || 'Desconhecido',
                    duration: entry.duration || 0,
                    durationFormatted: formatDuration(entry.duration || 0),
                    thumbnail: entry.thumbnail || (entry.thumbnails?.[0]?.url) || null,
                    url: entry.webpage_url || entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
                    platform: PLATFORMS.YOUTUBE,
                    type: 'audio'
                }))

                resolve(results)
            } catch (jsonErr) {
                const err = new Error('Erro ao processar dados de pesquisa.')
                err.code = MEDIA_ERRORS.SEARCH_FAILED
                reject(err)
            }
        })
    })
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Formata os resultados de pesquisa em texto legível para o usuário do WhatsApp
 * @param {string} query
 * @param {Array<object>} results
 * @returns {string}
 */
function formatSearchResults(query, results, { cmd = 'play', isAudio = true } = {}) {
    const icon = isAudio ? '🎵' : '🎬'
    const formatLabel = isAudio ? 'MP3' : 'MP4 HD'
    let msg = `╔══════════════════════════════╗\n`
    msg += `║   🔎 *RESULTADOS DA BUSCA* 🔎   ║\n`
    msg += `╚══════════════════════════════╝\n\n`
    msg += `📌 *Você buscou:* _${query}_\n`
    msg += `${icon} *${results.length} resultado(s) encontrado(s) para ${formatLabel}:*\n\n`

    results.forEach((r, i) => {
        const n = r.index || (i + 1)
        msg += `╭━〔 *${n}º* 〕━⬣\n`
        msg += `┃ 📝 *${String(r.title || 'Sem título').slice(0, 60)}*\n`
        msg += `┃ 👤 *Canal:* ${r.author || 'Desconhecido'}\n`
        msg += `┃ ⏱️ *Duração:* ${r.durationFormatted || '—'}\n`
        if (r.url) msg += `┃ 🔗 ${r.url}\n`
        msg += `╰━━━━━━━━━━━━━━━━━━⬣\n`
    })

    msg += `\n💡 *Para baixar, escolha o número:* \`.${cmd} <número>\`\n`
    msg += `📌 _Ex.:_ \`.${cmd} 1\` _baixa o primeiro resultado como ${formatLabel}._\n`
    msg += `_(a seleção expira em 5 minutos)_`
    return msg.trim()
}

module.exports = {
    searchMedia,
    formatSearchResults,
    formatDuration
}

