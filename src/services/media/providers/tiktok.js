/**
 * TikTok Media Provider & Resilient Downloader
 * Download direto de vídeos do TikTok em alta resolução sem marca d'água e suporte a Carrossel de Fotos
 */

const fs = require("fs");
const path = require("path");
const BaseProvider = require("./baseProvider");
const { PLATFORMS } = require("../constants");
const { tempDir } = require("../../../config/paths");
const logger = require("../../../core/logger");

/**
 * Resolve redirecionamentos de URLs encurtadas (vt.tiktok.com, vm.tiktok.com, /t/)
 */
async function expandShortUrl(url) {
    try {
        if (!url.includes('vt.tiktok.com') && !url.includes('vm.tiktok.com') && !url.includes('/t/')) {
            return url;
        }
        const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(8000)
        });
        return res.url || url;
    } catch (_) {
        return url;
    }
}

/**
 * Consulta JSON com timeout estrito via native fetch
 */
async function fetchJSON(url, timeoutMs = 12000) {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*"
        },
        signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/**
 * Download de arquivo com timeout estrito
 */
async function downloadFile(url, destPath, timeoutMs = 45000) {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) throw new Error(`Falha HTTP ${res.status}`);
    const arrayBuf = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuf));
    return destPath;
}

function downloadTikTokWithYtDlp(url, outputPath) {
    return new Promise((resolve, reject) => {
        const { spawn } = require("child_process");
        let getYtDlpEnv;
        try { getYtDlpEnv = require("../mediaArgs").getYtDlpEnv; } catch (_) { getYtDlpEnv = () => process.env; }

        const proc = spawn("yt-dlp", [
            "--no-playlist",
            "--no-warnings",
            "--impersonate", "chrome",
            "-f", "bv*+ba/b",
            "-S", "res,fps",
            "--merge-output-format", "mp4",
            "-o", outputPath,
            url
        ], { env: getYtDlpEnv() });

        let err = "";
        proc.stderr.on("data", d => { err += d; });
        const timer = setTimeout(() => {
            try { proc.kill("SIGKILL"); } catch (_) {}
            reject(new Error("Timeout no yt-dlp (45s)"));
        }, 45000);

        proc.on("close", code => {
            clearTimeout(timer);
            if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                resolve(outputPath);
            } else {
                reject(new Error(`yt-dlp erro (${code}): ${err.slice(0, 100)}`));
            }
        });
        proc.on("error", reject);
    });
}

async function downloadTikTokVideo(tiktokUrl) {
    const initialUrl = tiktokUrl.trim();
    const cleanUrl = await expandShortUrl(initialUrl);

    const videoTempDir = path.join(tempDir, "tiktok");
    if (!fs.existsSync(videoTempDir)) {
        fs.mkdirSync(videoTempDir, { recursive: true });
    }

    const jobId = "tiktok_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const outputPath = path.join(videoTempDir, jobId + ".mp4");

    // 1. TENTATIVA COM TIKWM API
    let res = null;
    try {
        const apiUrl = "https://www.tikwm.com/api/?url=" + encodeURIComponent(cleanUrl) + "&hd=1";
        res = await fetchJSON(apiUrl, 10000);
    } catch (e) {
        logger.warn("[TIKTOK] TikWM API indisponível: " + e.message);
    }

    // SE TIKWM RESPONDEU COM SUCESSO
    if (res && res.code === 0 && res.data) {
        const data = res.data;
        const uploadDate = data.create_time ? new Date(data.create_time * 1000).toISOString() : null;
        const year = data.create_time ? String(new Date(data.create_time * 1000).getFullYear()) : null;

        // VERIFICAÇÃO DE CARROSSEL DE FOTOS / SLIDESHOW
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const carouselItems = [];
            logger.info("[TIKTOK] Carrossel detectado com " + data.images.length + " imagens");

            for (let i = 0; i < data.images.length; i++) {
                let imgUrl = data.images[i];
                if (imgUrl.startsWith("/")) imgUrl = "https://www.tikwm.com" + imgUrl;
                const imgPath = path.join(videoTempDir, jobId + "_slide_" + (i + 1) + ".jpg");
                try {
                    await downloadFile(imgUrl, imgPath, 20000);
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
                uploadDate,
                year,
                musicTitle: data.music_info?.title || ""
            };
        }

        // VÍDEO DO TIKTOK: Prioriza hdplay (1080p sem marca d'água)
        let videoUrl = data.hdplay || data.play || data.wmplay;
        if (videoUrl) {
            if (videoUrl.startsWith("/")) {
                videoUrl = "https://www.tikwm.com" + videoUrl;
            }

            try {
                await downloadFile(videoUrl, outputPath, 40000);
                return {
                    isCarousel: false,
                    filePath: outputPath,
                    title: data.title || "Vídeo do TikTok",
                    author: data.author?.nickname || data.author?.unique_id || "TikTok User",
                    durationFormatted: data.duration ? (Math.floor(data.duration / 60) + ":" + String(data.duration % 60).padStart(2, "0")) : "—",
                    thumbnail: data.cover || data.origin_cover,
                    url: cleanUrl,
                    uploadDate,
                    year,
                    musicTitle: data.music_info?.title || ""
                };
            } catch (dlErr) {
                logger.warn("[TIKTOK] Falha no download do stream TikWM: " + dlErr.message);
            }
        }
    }

    // 2. TENTATIVA COM TIKLYDOWN API
    try {
        const tiklyUrl = "https://api.tiklydown.eu.org/api/download?url=" + encodeURIComponent(cleanUrl);
        const tRes = await fetchJSON(tiklyUrl, 8000);
        if (tRes && (tRes.video || tRes.url)) {
            const stream = tRes.video?.noWatermark || tRes.video?.watermark || tRes.url;
            if (stream) {
                await downloadFile(stream, outputPath, 40000);
                return {
                    isCarousel: false,
                    filePath: outputPath,
                    title: tRes.title || "Vídeo do TikTok",
                    author: tRes.author?.name || "TikTok Creator",
                    durationFormatted: "—",
                    thumbnail: null,
                    url: cleanUrl,
                    uploadDate: tRes.created_at || null,
                    year: tRes.created_at ? String(new Date(tRes.created_at).getFullYear()) : null,
                    musicTitle: tRes.music?.title || ""
                };
            }
        }
    } catch (_) {}

    // 3. FALLBACK VIA YT-DLP COM IMPERSONATE CHROME
    logger.info("[TIKTOK] Baixando via yt-dlp na resolução máxima...");
    await downloadTikTokWithYtDlp(cleanUrl, outputPath);

    return {
        isCarousel: false,
        filePath: outputPath,
        title: "Vídeo do TikTok",
        author: "TikTok Creator",
        durationFormatted: "—",
        thumbnail: null,
        url: cleanUrl,
        uploadDate: null,
        year: null,
        musicTitle: ""
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
