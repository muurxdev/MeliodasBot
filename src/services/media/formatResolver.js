/**
 * Format & Quality Resolver
 * Mapeia formatos (MP3, M4A, MP4) e resoluções para argumentos otimizados do yt-dlp e FFmpeg
 */

const { FORMATS, QUALITIES } = require('./constants')

/**
 * Retorna os argumentos de formato e pós-processamento para o yt-dlp
 * @param {object} options
 * @param {string} options.format - 'mp3', 'm4a', 'mp4'
 * @param {string} options.quality - '1080p', '720p', '480p', '360p', 'best'
 * @returns {{ args: Array<string>, targetExt: string, mimeType: string }}
 */
function resolveDownloadFormat({ format = FORMATS.MP3, quality = QUALITIES.BEST } = {}) {
    const fmt = (format || FORMATS.MP3).toLowerCase()
    const qual = (quality || QUALITIES.BEST).toLowerCase()

    if (fmt === FORMATS.MP3) {
        return {
            args: [
                '-f', 'bestaudio/best',
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--prefer-free-formats',
                '--embed-thumbnail',
                '--add-metadata'
            ],
            targetExt: 'mp3',
            mimeType: 'audio/mpeg'
        }
    }

    if (fmt === FORMATS.M4A) {
        return {
            args: [
                '-f', 'ba[ext=m4a]/ba/best',
                '-x',
                '--audio-format', 'm4a',
                '--add-metadata'
            ],
            targetExt: 'm4a',
            mimeType: 'audio/mp4'
        }
    }

    // Formato de Vídeo — MAIOR resolução possível, sempre entregue como MP4.
    // NÃO forçamos [ext=mp4] no seletor: no YouTube o mp4/h264 trava em 1080p
    // (acima disso é vp9/av1 em webm). Pegamos o melhor vídeo+áudio de qualquer
    // codec e remuxamos/recodificamos para MP4 (compatível com WhatsApp).
    let heightFilter = ''
    if (qual === QUALITIES.P1080) heightFilter = '[height<=1080]'
    else if (qual === QUALITIES.P720) heightFilter = '[height<=720]'
    else if (qual === QUALITIES.P480) heightFilter = '[height<=480]'
    else if (qual === QUALITIES.P360) heightFilter = '[height<=360]'
    // 'best' (default) = sem teto de altura → maior resolução disponível

    const videoSelector = `bv*${heightFilter}+ba/b${heightFilter}/bv*+ba/b`

    return {
        args: [
            '-f', videoSelector,
            '--merge-output-format', 'mp4',
            // Garante container MP4 mesmo quando o melhor vídeo vem em vp9/webm
            '--remux-video', 'mp4',
            '--add-metadata'
        ],
        targetExt: 'mp4',
        mimeType: 'video/mp4'
    }
}

/**
 * Identifica o nome limpo e oficial da plataforma a partir da URL ou termo de pesquisa
 * @param {string} urlOrQuery
 * @returns {string}
 */
function getPlatformDisplayName(urlOrQuery) {
    if (!urlOrQuery || typeof urlOrQuery !== 'string') return 'YouTube'
    const clean = urlOrQuery.trim().toLowerCase()

    if (/music\.youtube\.com/i.test(clean)) return 'YouTube Music'
    if (/kwai\.com|k\.kwai\.com|v\.kwai\.com|kwai-video\.com/i.test(clean)) return 'Kwai'
    if (/tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(clean)) return 'TikTok'
    if (/instagram\.com|instagr\.am/i.test(clean)) return 'Instagram'
    if (/twitter\.com|x\.com/i.test(clean)) return 'Twitter (X)'
    if (/pinterest\.com|pin\.it/i.test(clean)) return 'Pinterest'
    if (/reddit\.com/i.test(clean)) return 'Reddit'
    if (/facebook\.com|fb\.watch/i.test(clean)) return 'Facebook'
    if (/threads\.net/i.test(clean)) return 'Threads'
    if (/soundcloud\.com/i.test(clean)) return 'SoundCloud'
    if (/spotify\.com/i.test(clean)) return 'Spotify'
    if (/youtu(\.be|be\.com)/i.test(clean)) return 'YouTube'

    if (/^https?:\/\//i.test(clean)) {
        try {
            const parsed = new URL(clean)
            return parsed.hostname.replace(/^www\./, '')
        } catch (_) {
            return 'Web'
        }
    }
    return 'YouTube'
}

const { getBotName } = require('../../config/botConfig')
const { spawnSync } = require('child_process')
const fs = require('fs')

/** Formata bytes em KB / MB / GB legível (nunca mostra bytes crus). */
function formatBytes(bytes) {
    const n = Number(bytes) || 0
    if (n <= 0) return null
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + ' MB'
    return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

/** Formata uma duração em ms para tempo legível de download (ex.: "12s", "1m 05s"). */
function formatElapsed(ms) {
    const s = Math.max(0, Math.round((Number(ms) || 0) / 1000))
    if (s < 60) return s + 's'
    return Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's'
}

/**
 * Inspeciona o arquivo REAL com ffprobe e retorna dados verdadeiros — nada inventado.
 * @param {string} filePath
 * @returns {null | { container, vcodec, acodec, width, height, resolution, sizeBytes, sizeMB, durationSec, isAudio }}
 */
function probeMedia(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) return null
        const r = spawnSync('ffprobe', [
            '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath
        ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
        if (r.status !== 0 || !r.stdout) return null
        const data = JSON.parse(r.stdout)
        const streams = data.streams || []
        const v = streams.find(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
        const a = streams.find(s => s.codec_type === 'audio')
        const fmt = data.format || {}
        const sizeBytes = Number(fmt.size || (fs.statSync(filePath).size)) || 0
        const durationSec = Math.round(Number(fmt.duration || (v?.duration) || (a?.duration) || 0))
        // ffprobe reporta a família "mov,mp4,m4a,3gp,..." — normaliza para MP4/M4A.
        const rawContainer = (fmt.format_name || '')
        let container = rawContainer.split(',')[0] || filePath.split('.').pop()
        if (/mp4|mov|m4a|3gp/i.test(rawContainer)) {
            container = (a && !v) ? 'M4A' : 'MP4'
        }
        return {
            container: container.toUpperCase(),
            vcodec: v?.codec_name || null,
            acodec: a?.codec_name || null,
            width: v?.width || 0,
            height: v?.height || 0,
            resolution: v ? `${v.width}x${v.height}` : null,
            sizeBytes,
            sizeMB: sizeBytes ? (sizeBytes / 1024 / 1024).toFixed(2) : null,
            durationSec,
            isAudio: !v
        }
    } catch (_) {
        return null
    }
}

/**
 * Formata um cartão com os dados REAIS da mídia baixada (via ffprobe quando há filePath).
 * Sem claims inventados ("alta fidelidade", "sem marca d'água"): só formato e resolução reais.
 * @param {object} params
 * @returns {string}
 */
function formatMediaCaption({ platform = 'Web', title = 'Mídia', author = 'Desconhecido', durationFormatted = '—', url = '', isAudio = false, filePath = null, elapsedMs = null } = {}) {
    const botName = getBotName()
    const probe = filePath ? probeMedia(filePath) : null
    const audio = probe ? probe.isAudio : isAudio
    const icon = audio ? '🎵' : '🎬'
    const headerTitle = audio ? 'ÁUDIO BAIXADO' : 'VÍDEO BAIXADO'

    let doc = `╔══════════════════════════════╗\n`
    doc += `║   ${icon} *${headerTitle}* ${icon}   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `╭━〔 🌐 DETALHES DA MÍDIA 〕━⬣\n`
    doc += `┃ 📱 *Plataforma:* ${platform}\n`
    doc += `┃ 📝 *Título:* ${String(title || 'Mídia').slice(0, 100)}\n`
    doc += `┃ 👤 *Autor:* ${author || 'Desconhecido'}\n`

    // Duração real (do arquivo) tem prioridade sobre a informada
    if (probe && probe.durationSec > 0) {
        doc += `┃ ⏱️ *Duração:* ${formatDuration(probe.durationSec)}\n`
    } else if (durationFormatted && durationFormatted !== '—' && durationFormatted !== '00:00') {
        doc += `┃ ⏱️ *Duração:* ${durationFormatted}\n`
    }

    if (probe) {
        // Dados 100% reais do arquivo
        if (!audio && probe.resolution) doc += `┃ 🖥️ *Resolução:* ${probe.resolution}${probe.vcodec ? ' (' + probe.vcodec + ')' : ''}\n`
        doc += `┃ 📦 *Formato:* ${probe.container}${audio && probe.acodec ? ' / ' + probe.acodec : ''}\n`
        const sizeStr = formatBytes(probe.sizeBytes)
        if (sizeStr) doc += `┃ 💾 *Tamanho:* ${sizeStr}\n`
    } else {
        // Sem probe: mostra só o formato-alvo, sem inventar resolução/qualidade
        doc += `┃ 📦 *Formato:* ${audio ? 'MP3' : 'MP4'}\n`
    }

    // Tempo REAL que levou para baixar (medido), quando disponível
    if (elapsedMs) doc += `┃ ⏬ *Baixado em:* ${formatElapsed(elapsedMs)}\n`
    if (url) doc += `┃ 🔗 *Fonte:* ${url}\n`
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
    doc += `👑 *${botName}*`
    return doc.trim()
}

function formatDuration(sec) {
    sec = Math.max(0, Math.round(sec))
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n) => String(n).padStart(2, '0')
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/**
 * Calcula o tempo estimado de espera baseado na duração ou tipo de mídia
 * @param {number|string} duration
 * @returns {string}
 */
function getEstimatedWaitTime(duration) {
    let sec = 0
    if (typeof duration === 'number') sec = duration
    else if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':').map(Number)
        if (parts.length === 2) sec = parts[0] * 60 + parts[1]
        else if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (sec <= 0) return '~5 a 12 seg'
    if (sec <= 60) return '~4 a 8 seg'
    if (sec <= 300) return '~8 a 15 seg'
    if (sec <= 900) return '~15 a 30 seg'
    if (sec <= 1800) return '~30 a 60 seg'
    return '~1 a 2 min'
}

/**
 * Gera um card interativo com status e estimativa de tempo
 * @param {object} params
 * @returns {string}
 */
function formatDownloadProgressCard({ platform = 'YouTube', title = '', isAudio = false, estimatedTime = null, sizeMB = null, quality = null } = {}) {
    const botName = getBotName()
    const icon = isAudio ? '🎵' : '🎬'
    const typeLabel = isAudio ? 'Áudio (MP3)' : (quality ? `Vídeo (MP4, ${quality})` : 'Vídeo (MP4)')

    let doc = `╔══════════════════════════════╗\n`
    doc += `║   📥 *DOWNLOAD EM ANDAMENTO* 📥   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `╭━〔 🌐 DETALHES DO PEDIDO 〕━⬣\n`
    doc += `┃ 📱 *Plataforma:* ${platform}\n`
    if (title && title !== 'Mídia' && title !== 'Vídeo do YouTube') {
        doc += `┃ 📝 *Título:* ${title.slice(0, 50)}\n`
    }
    doc += `┃ ${icon} *Mídia:* ${typeLabel}\n`
    // Só mostra tamanho/tempo se forem valores REAIS vindos do metadata/progresso.
    if (sizeMB) doc += `┃ 💾 *Tamanho:* ~${sizeMB} MB\n`
    if (estimatedTime) doc += `┃ ⏳ *Tempo estimado:* ${estimatedTime}\n`
    doc += `┃ ⚡ *Status:* 📥 Baixando...\n`
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
    doc += `👑 *${botName}*`
    return doc.trim()
}

module.exports = {
    resolveDownloadFormat,
    getPlatformDisplayName,
    formatMediaCaption,
    getEstimatedWaitTime,
    formatDownloadProgressCard,
    probeMedia,
    formatBytes,
    formatElapsed,
    formatDuration
}

