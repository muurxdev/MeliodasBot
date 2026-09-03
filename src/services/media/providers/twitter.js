/**
 * Twitter / X Media Provider (Twitsave API)
 * Download de vídeos do Twitter/X em alta resolução
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')
const { tempDir } = require('../../../config/paths')
const logger = require('../../../core/logger')

async function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
            let data = ''
            res.on('data', chunk => { data += chunk })
            res.on('end', () => resolve(data))
        }).on('error', reject)
    })
}

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url)
        const client = parsed.protocol === 'https:' ? https : http
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Falha ao baixar vídeo do Twitter (HTTP ${res.statusCode})`))
            }
            const fileStream = fs.createWriteStream(destPath)
            res.pipe(fileStream)
            fileStream.on('finish', () => {
                fileStream.close(() => resolve(destPath))
            })
            fileStream.on('error', reject)
        }).on('error', reject)
    })
}

async function downloadTwitterVideo(twitterUrl) {
    const cleanUrl = twitterUrl.trim()
    const twitsaveUrl = `https://twitsave.com/info?url=${encodeURIComponent(cleanUrl)}`

    const html = await fetchHTML(twitsaveUrl)

    // Extrai o link direto de download do vídeo em MP4
    const downloadMatches = [...html.matchAll(/href="(https:\/\/twitsave\.com\/download\?[^"]+)"/g)]
    const directVideoMatches = [...html.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/g)]

    let videoDownloadUrl = downloadMatches[0]?.[1] || directVideoMatches[0]?.[1]

    if (!videoDownloadUrl) {
        throw new Error('Nenhum vídeo em alta resolução encontrado neste link do Twitter / X.')
    }

    const titleMatch = html.match(/<p class="[^"]*text-gray-800[^"]*">([^<]+)<\/p>/)
    const authorMatch = html.match(/<h2 class="[^"]*font-bold[^"]*">([^<]+)<\/h2>/)

    const videoTempDir = path.join(tempDir, 'twitter')
    if (!fs.existsSync(videoTempDir)) {
        fs.mkdirSync(videoTempDir, { recursive: true })
    }

    const jobId = `twitter_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const outputPath = path.join(videoTempDir, `${jobId}.mp4`)

    await downloadFile(videoDownloadUrl, outputPath)

    return {
        filePath: outputPath,
        title: titleMatch ? titleMatch[1].trim() : 'Vídeo do Twitter / X',
        author: authorMatch ? authorMatch[1].trim() : 'Twitter User',
        durationFormatted: '—',
        thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600',
        url: cleanUrl
    }
}

class TwitterProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.TWITTER)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        const lower = url.toLowerCase()
        return lower.includes('twitter.com/') || lower.includes('x.com/')
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url)
            return `${parsed.origin}${parsed.pathname}`
        } catch (_) {
            return url
        }
    }
}

TwitterProvider.downloadTwitterVideo = downloadTwitterVideo

module.exports = TwitterProvider
module.exports.downloadTwitterVideo = downloadTwitterVideo
