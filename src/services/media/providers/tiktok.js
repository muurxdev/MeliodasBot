/**
 * MeliodasBot — TikTok Media Provider & Fast Downloader (TikWM API)
 * Download direto de vídeos do TikTok em alta resolução sem marca d'água e suporte a Carrossel de Fotos
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const BaseProvider = require("./baseProvider");
const { PLATFORMS } = require("../constants");
const { tempDir } = require("../../../config/paths");
const logger = require("../../../core/logger");

async function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const client = parsed.protocol === "https:" ? https : http;
        client.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, res => {
            let data = "";
            res.on("data", chunk => { data += chunk; });
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(new Error("Resposta inválida do servidor TikTok."));
                }
            });
        }).on("error", reject);
    });
}

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const client = parsed.protocol === "https:" ? https : http;
        client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error("Falha ao baixar arquivo de mídia (HTTP " + res.statusCode + ")"));
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close(() => resolve(destPath));
            });
            fileStream.on("error", reject);
        }).on("error", reject);
    });
}

async function downloadTikTokVideo(tiktokUrl) {
    const cleanUrl = tiktokUrl.trim();
    const apiUrl = "https://www.tikwm.com/api/?url=" + encodeURIComponent(cleanUrl);

    const res = await fetchJSON(apiUrl);

    if (!res || res.code !== 0 || !res.data) {
        throw new Error(res?.msg || "Vídeo do TikTok não encontrado ou indisponível.");
    }

    const data = res.data;

    const videoTempDir = path.join(tempDir, "tiktok");
    if (!fs.existsSync(videoTempDir)) {
        fs.mkdirSync(videoTempDir, { recursive: true });
    }

    const jobId = "tiktok_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    // 1. VERIFICAÇÃO DE CARROSSEL DE FOTOS / SLIDESHOW
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const carouselItems = [];
        logger.info("[TIKTOK] Carrossel detectado com " + data.images.length + " imagens");

        for (let i = 0; i < data.images.length; i++) {
            let imgUrl = data.images[i];
            if (imgUrl.startsWith("/")) imgUrl = "https://www.tikwm.com" + imgUrl;
            const imgPath = path.join(videoTempDir, jobId + "_slide_" + (i + 1) + ".jpg");
            try {
                await downloadFile(imgUrl, imgPath);
                carouselItems.push({ path: imgPath, type: "image", index: i + 1 });
            } catch (imgErr) {
                logger.warn("[TIKTOK CAROUSEL WARN] Falha ao baixar slide " + (i + 1) + ": " + imgErr.message);
            }
        }

        return {
            isCarousel: true,
            carouselCount: carouselItems.length,
            carouselItems,
            title: data.title || "Carrossel do TikTok",
            author: data.author?.nickname || data.author?.unique_id || "TikTok User",
            durationFormatted: "—",
            thumbnail: data.cover || data.origin_cover,
            url: cleanUrl,
            musicTitle: data.music_info?.title || ""
        };
    }

    // 2. VÍDEO PADRÃO DO TIKTOK
    let videoUrl = data.hdplay || data.play || data.wmplay;

    if (!videoUrl) {
        throw new Error("Link direto de reprodução do TikTok indisponível.");
    }

    if (videoUrl.startsWith("/")) {
        videoUrl = "https://www.tikwm.com" + videoUrl;
    }

    const outputPath = path.join(videoTempDir, jobId + ".mp4");
    await downloadFile(videoUrl, outputPath);

    return {
        isCarousel: false,
        filePath: outputPath,
        title: data.title || "Vídeo do TikTok",
        author: data.author?.nickname || data.author?.unique_id || "TikTok User",
        durationFormatted: data.duration ? (Math.floor(data.duration / 60) + ":" + String(data.duration % 60).padStart(2, "0")) : "—",
        thumbnail: data.cover || data.origin_cover,
        url: cleanUrl,
        musicTitle: data.music_info?.title || ""
    };
}

class TikTokProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.TIKTOK);
    }

    match(url) {
        if (!url || typeof url !== "string") return false;
        const lower = url.toLowerCase();
        return (
            lower.includes("tiktok.com/@") ||
            lower.includes("vm.tiktok.com/") ||
            lower.includes("vt.tiktok.com/") ||
            lower.includes("tiktok.com/t/")
        );
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.origin + parsed.pathname;
        } catch (_) {
            return url;
        }
    }
}

TikTokProvider.downloadTikTokVideo = downloadTikTokVideo;

module.exports = TikTokProvider;
module.exports.downloadTikTokVideo = downloadTikTokVideo;
