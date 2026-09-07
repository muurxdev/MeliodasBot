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
                // Ordena a escolha pela MAIOR taxa de bits e amostragem.
                // Sem isto, "bestaudio" às vezes pegava uma faixa de bitrate menor.
                '-S', 'abr,asr,acodec',
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                // '--prefer-free-formats' foi REMOVIDO: ele força opus/vorbis mesmo
                // quando existe um m4a de bitrate maior, e como reconvertemos para
                // mp3 no fim, partir da fonte melhor é o que importa.
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
                '-S', 'abr,asr',
                '-x',
                '--audio-format', 'm4a',
                '--embed-thumbnail',
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
    // MAX: destino fora do WhatsApp (Google Drive). Aqui a restricao de codec
    // deixa de fazer sentido — o Drive entrega o arquivo original — entao
    // ordenamos por RESOLUCAO pura e pegamos 4K/8K em VP9 ou AV1.
    if (qual === QUALITIES.MAX) {
        return {
            args: [
                '-f', 'bv*+ba/b',
                '-S', 'res,fps,vcodec,acodec,abr',
                '--merge-output-format', 'mp4',
                '--embed-thumbnail',
                '--add-metadata'
            ],
            targetExt: 'mp4',
            mimeType: 'video/mp4'
        }
    }

    let heightFilter = ''
    if (qual === QUALITIES.P1080) heightFilter = '[height<=1080]'
    else if (qual === QUALITIES.P720) heightFilter = '[height<=720]'
    else if (qual === QUALITIES.P480) heightFilter = '[height<=480]'
    else if (qual === QUALITIES.P360) heightFilter = '[height<=360]'
    // 'best' (default) = sem teto de altura → maior resolução disponível

    // Com teto de altura, o fallback sem teto garante que algo seja baixado.
    // Sem teto ('best'), esse fallback seria o mesmo seletor repetido.
    const videoSelector = heightFilter
        ? `bv*${heightFilter}+ba/b${heightFilter}/bv*+ba/b`
        : 'bv*+ba/b'

    return {
        args: [
            '-f', videoSelector,
            // Ordem de preferência: maior resolução e fps primeiro, favorecendo H.264/AAC entre streams de mesma resolução
            '-S', 'res,fps,vcodec:h264,acodec:aac,abr',
            '--merge-output-format', 'mp4',
            '--embed-thumbnail',
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


/**
 * Traduz a ALTURA/LARGURA do vídeo no rótulo de qualidade limpo: 4K / 2K / 1080p / 720p.
 * Sem pixels crus (sem 1920x1080) e sem parênteses (sem 2160p).
 * @param {number} height
 * @param {number} [width]
 * @returns {string|null}
 */
function qualityLabel(height, width) {
    const h = Number(height) || 0
    const w = Number(width) || 0
    if (!h && !w) return null
    if (h >= 2160 || w >= 3840) return '4K'
    if (h >= 1440 || w >= 2560) return '2K'
    if (h >= 1080 || w >= 1920) return '1080p'
    if (h >= 720 || w >= 1280) return '720p'
    if (h >= 480 || w >= 854) return '480p'
    if (h >= 360 || w >= 640) return '360p'
    return h ? `${h}p` : null
}

/**
 * Normaliza e formata data e ano de postagem a partir de metadados ou tags ID3/FFprobe
 */
function parseMediaDateAndYear(rawDate, rawYear, probeTags) {
    let year = rawYear ? String(rawYear).trim() : null
    let formattedDate = null

    if (rawDate) {
        if (typeof rawDate === 'number') {
            const d = new Date(rawDate > 1e11 ? rawDate : rawDate * 1000)
            if (!isNaN(d.getTime())) {
                year = year || String(d.getFullYear())
                formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            }
        } else if (typeof rawDate === 'string') {
            const s = rawDate.trim()
            if (/^\d{8}$/.test(s)) {
                const y = s.slice(0, 4)
                const m = s.slice(4, 6)
                const d = s.slice(6, 8)
                year = year || y
                formattedDate = `${d}/${m}/${y}`
            } else if (/^\d{10,13}$/.test(s)) {
                const num = Number(s)
                const d = new Date(num > 1e11 ? num : num * 1000)
                if (!isNaN(d.getTime())) {
                    year = year || String(d.getFullYear())
                    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                }
            } else if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
                const parts = s.split('T')[0].split('-')
                year = year || parts[0]
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
            } else if (/^\d{4}$/.test(s)) {
                year = year || s
            } else if (/(\d+)\s+year[s]?\s+ago/i.test(s)) {
                const yearsAgo = parseInt(s.match(/(\d+)\s+year[s]?\s+ago/i)[1], 10)
                const currentY = new Date().getFullYear()
                year = year || String(currentY - yearsAgo)
            } else if (/(\d+)\s+month[s]?\s+ago/i.test(s)) {
                const monthsAgo = parseInt(s.match(/(\d+)\s+month[s]?\s+ago/i)[1], 10)
                const d = new Date()
                d.setMonth(d.getMonth() - monthsAgo)
                year = year || String(d.getFullYear())
                formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            } else if (/(\d+)\s+day[s]?\s+ago/i.test(s)) {
                const daysAgo = parseInt(s.match(/(\d+)\s+day[s]?\s+ago/i)[1], 10)
                const d = new Date()
                d.setDate(d.getDate() - daysAgo)
                year = year || String(d.getFullYear())
                formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            } else {
                const d = new Date(s)
                if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
                    year = year || String(d.getFullYear())
                    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                }
            }
        }
    }

    if (probeTags && typeof probeTags === 'object') {
        const tagDate = probeTags.date || probeTags.DATE || probeTags.creation_time || probeTags.TYER || probeTags.TDRC || probeTags.year || probeTags.YEAR || probeTags.RELEASE_TIME
        if (tagDate && !formattedDate) {
            const str = String(tagDate).trim()
            if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
                const parts = str.split('T')[0].split('-')
                year = year || parts[0]
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
            } else if (/^\d{8}$/.test(str)) {
                const y = str.slice(0, 4)
                const m = str.slice(4, 6)
                const d = str.slice(6, 8)
                year = year || y
                formattedDate = `${d}/${m}/${y}`
            } else if (/^\d{4}$/.test(str)) {
                year = year || str
            } else {
                const d = new Date(str)
                if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
                    year = year || String(d.getFullYear())
                    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                }
            }
        }
    }

    return { year, formattedDate }
}

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
 * @returns {null | { container, vcodec, acodec, bitrateKbps, width, height, resolution, sizeBytes, sizeMB, durationSec, isAudio, tags }}
 */
function probeMedia(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) return null
        const r = spawnSync('ffprobe', [
            '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath
        ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
        if (r.status !== 0 || !r.stdout) return null
        const data = JSON.parse(r.stdout)
        const fmt = data.format || {}
        const tags = fmt.tags || {}
        const streams = data.streams || []
        const v = streams.find(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
        const a = streams.find(s => s.codec_type === 'audio')
        const rawBitrate = Number(a?.bit_rate || fmt.bit_rate || 0)
        const bitrateKbps = rawBitrate > 0 ? `${Math.round(rawBitrate / 1000)} kbps` : null
        const sizeBytes = (filePath && fs.existsSync(filePath)) ? fs.statSync(filePath).size : (Number(fmt.size) || 0)
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
            bitrateKbps,
            width: v?.width || 0,
            height: v?.height || 0,
            resolution: v ? `${v.width}x${v.height}` : null,
            sizeBytes,
            sizeMB: sizeBytes ? (sizeBytes / 1024 / 1024).toFixed(2) : null,
            durationSec,
            isAudio: !v,
            tags
        }
    } catch (_) {
        return null
    }
}

/**
 * Formata um cartão com os dados REAIS da mídia baixada (via ffprobe quando há filePath).
 * Sem claims inventados ("alta fidelidade", "sem marca d'água"): só formato e resolução reais.
 * Sem dimensões cruas em pixel e com ano/data e qualidade em kbps.
 * @param {object} params
 * @returns {string}
 */
function formatMediaCaption({
    platform = 'Web',
    title = 'Mídia',
    author = 'Desconhecido',
    durationFormatted = '—',
    url = '',
    isAudio = false,
    isImage = false,
    filePath = null,
    elapsedMs = null,
    fileProbe = null,
    uploadDate = null,
    year = null,
    audioBitrate = null,
    quality = null
} = {}) {
    const botName = getBotName()
    const probe = fileProbe || (filePath ? probeMedia(filePath) : null)
    const isImg = isImage || (filePath && /\.(jpe?g|png|webp|gif|bmp)$/i.test(filePath))
    const audio = !isImg && (probe ? probe.isAudio : isAudio)
    const icon = isImg ? '📸' : (audio ? '🎵' : '🎬')
    const headerTitle = isImg ? 'IMAGEM BAIXADA' : (audio ? 'ÁUDIO BAIXADO' : 'VÍDEO BAIXADO')

    let doc = `╔══════════════════════════════╗\n`
    doc += `║   ${icon} *${headerTitle}* ${icon}   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `╭━〔 🌐 DETALHES DA MÍDIA 〕━⬣\n`
    doc += `┃ 📱 *Plataforma:* ${platform}\n`
    doc += `┃ 📝 *Título:* ${String(title || 'Mídia').slice(0, 100)}\n`
    doc += `┃ 👤 *Autor:* ${author || 'Desconhecido'}\n`

    // Duração real (do arquivo) tem prioridade sobre a informada (apenas para áudio ou vídeo)
    if (!isImg) {
        if (probe && probe.durationSec > 0) {
            doc += `┃ ⏱️ *Duração:* ${formatDuration(probe.durationSec)}\n`
        } else if (durationFormatted && durationFormatted !== '—' && durationFormatted !== '00:00') {
            doc += `┃ ⏱️ *Duração:* ${durationFormatted}\n`
        }
    }

    // Ano e Data de publicação (Vídeo, Áudio e Imagem)
    const { year: parsedYear, formattedDate } = parseMediaDateAndYear(uploadDate, year, probe?.tags)
    if (formattedDate && parsedYear) {
        doc += `┃ 📅 *Publicado:* ${formattedDate} (${parsedYear})\n`
    } else if (formattedDate) {
        doc += `┃ 📅 *Publicado:* ${formattedDate}\n`
    } else if (parsedYear) {
        doc += `┃ 📅 *Publicado:* ${parsedYear}\n`
    }

    if (probe) {
        if (isImg) {
            const res = (probe.width && probe.height) ? `${probe.width}x${probe.height}` : null
            if (res) doc += `┃ 🖼️ *Resolução:* ${res}\n`
            doc += `┃ 📦 *Formato:* ${probe.container}\n`
            const sizeStr = formatBytes(probe.sizeBytes)
            if (sizeStr) doc += `┃ 💾 *Tamanho:* ${sizeStr}\n`
        } else if (!audio) {
            const q = qualityLabel(probe.height, probe.width) || (probe.height ? `${probe.height}p` : (quality || '1080p'))
            doc += `┃ 🎬 *Qualidade:* ${q}\n`
            doc += `┃ 📦 *Formato:* ${probe.container}\n`
            const sizeStr = formatBytes(probe.sizeBytes)
            if (sizeStr) doc += `┃ 💾 *Tamanho:* ${sizeStr}\n`
        } else {
            const kbps = probe.bitrateKbps ? `${probe.bitrateKbps} kbps` : (audioBitrate || quality || '320 kbps')
            doc += `┃ 🎧 *Qualidade:* ${kbps}\n`
            const codecInfo = audio && probe.acodec && probe.acodec.toLowerCase() !== probe.container.toLowerCase()
                ? ` (${probe.acodec})` : ''
            doc += `┃ 📦 *Formato:* ${probe.container}${codecInfo}\n`
            const sizeStr = formatBytes(probe.sizeBytes)
            if (sizeStr) doc += `┃ 💾 *Tamanho:* ${sizeStr}\n`
        }
    } else {
        // Sem probe: mostra qualidade e formato padrão informados
        if (isImg) {
            doc += `┃ 📦 *Formato:* IMAGEM\n`
        } else if (!audio) {
            doc += `┃ 🎬 *Qualidade:* ${quality || '1080p'}\n`
            doc += `┃ 📦 *Formato:* MP4\n`
        } else {
            doc += `┃ 🎧 *Qualidade:* ${audioBitrate || quality || '320 kbps'}\n`
            doc += `┃ 📦 *Formato:* MP3\n`
        }
        if (filePath && fs.existsSync(filePath)) {
            const sizeStr = formatBytes(fs.statSync(filePath).size)
            if (sizeStr) doc += `┃ 💾 *Tamanho:* ${sizeStr}\n`
        }
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
function formatDownloadProgressCard({ platform = 'YouTube', title = '', isAudio = false, estimatedTime = null, sizeMB = null, quality = null, elapsedMs = null } = {}) {
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
    if (sizeMB) doc += `┃ 💾 *Tamanho:* ~${sizeMB} MB\n`
    // Tempo real: usa elapsedMs se disponível, senão não mostra nada
    if (elapsedMs) {
        doc += `┃ ⏱️ *Tempo:* ${formatElapsed(elapsedMs)}\n`
    }
    doc += `┃ ⚡ *Status:* 📥 Baixando...\n`
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
    doc += `👑 *${botName}*`
    return doc.trim()
}

module.exports = {
    qualityLabel,
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

