/**
 * Media Engine Constants & Error Enums
 */

const PLATFORMS = {
    YOUTUBE: 'youtube',
    INSTAGRAM: 'instagram',
    TIKTOK: 'tiktok',
    KWAI: 'kwai',
    TWITTER: 'twitter',
    REDDIT: 'reddit',
    PINTEREST: 'pinterest',
    FACEBOOK: 'facebook',
    GENERIC: 'generic'
}

const MEDIA_TYPES = {
    AUDIO: 'audio',
    VIDEO: 'video',
    IMAGE: 'image',
    GALLERY: 'gallery'
}

const FORMATS = {
    MP3: 'mp3',
    M4A: 'm4a',
    MP4: 'mp4'
}

const QUALITIES = {
    BEST: 'best',
    // MAX = maior resolucao existente (4K/8K), SEM a trava de codec H.264.
    // So faz sentido quando o destino NAO e a galeria do WhatsApp (ex.: Drive),
    // porque VP9/AV1 nao toca no app.
    MAX: 'max',
    P1080: '1080p',
    P720: '720p',
    P480: '480p',
    P360: '360p'
}

const MEDIA_ERRORS = {
    INVALID_URL: 'INVALID_URL',
    UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
    SEARCH_FAILED: 'SEARCH_FAILED',
    NO_RESULTS: 'NO_RESULTS',
    MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
    FORMAT_UNAVAILABLE: 'FORMAT_UNAVAILABLE',
    DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
    PROCESSING_FAILED: 'PROCESSING_FAILED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    DURATION_TOO_LONG: 'DURATION_TOO_LONG',
    TIMEOUT: 'TIMEOUT',
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    CANCELLED: 'CANCELLED',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    EXECUTABLE_NOT_FOUND: 'EXECUTABLE_NOT_FOUND'
}

/**
 * Interpreta valores de milissegundos vindos de variáveis de ambiente.
 * Ex: MEDIA_DOWNLOAD_TIMEOUT_MS=240000 -> 240000. Inválido/ausente -> fallback.
 * @param {string} value
 * @param {number} fallback
 * @returns {number}
 */
function parseEnvMs(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

const MEDIA_LIMITS = {
    // 2000 MB (2 GB): limite máximo suportado pelo WhatsApp como documento / vídeo
    MAX_FILE_SIZE_BYTES: parseEnvMs(process.env.MEDIA_MAX_FILE_SIZE_BYTES, 2000 * 1024 * 1024),
    // 6 horas. O teto anterior era 60 min e recusava live/DVD/"as melhores"
    // de pagode — justamente o conteudo longo que as pessoas mais pedem.
    // Quem limita de verdade e o disco (diskGuard), nao um numero fixo aqui.
    MAX_DURATION_SECONDS: parseEnvMs(process.env.MEDIA_MAX_DURATION_SECONDS, 6 * 3600),
    MAX_GALLERY_ITEMS: 10,
    SEARCH_LIMIT: 5,
    PROCESS_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_PROCESS_TIMEOUT_MS, 180000), // 3 minutos
    DOWNLOAD_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_DOWNLOAD_TIMEOUT_MS, 180000), // piso: 3 minutos
    // Teto de 90 min. O tempo ja escala com a duracao (duration * 1200), mas o
    // teto de 15 min cortava o download de qualquer coisa acima de ~1h antes de
    // terminar — o arquivo chegava truncado ou nao chegava.
    MAX_DOWNLOAD_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_MAX_DOWNLOAD_TIMEOUT_MS, 90 * 60 * 1000),
    METADATA_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_METADATA_TIMEOUT_MS, 30000), // 30 segundos
    MAX_CONCURRENT_DOWNLOADS: 3
}

module.exports = {
    PLATFORMS,
    MEDIA_TYPES,
    FORMATS,
    QUALITIES,
    MEDIA_ERRORS,
    MEDIA_LIMITS,
    parseEnvMs
}

