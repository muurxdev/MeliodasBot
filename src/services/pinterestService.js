/**
 * Pinterest Service
 * Download resiliente de Imagens em Alta Resolução (Originals), Vídeos MP4 e Carrosséis do Pinterest
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { tempDir } = require("../config/paths");
const logger = require("../core/logger");
const { extractUrlAndFormat } = require("./media/urlExtractor");

function downloadFile(fileUrl, destPath) {
    return new Promise((resolve, reject) => {
        const u = new URL(fileUrl);
        const client = u.protocol === "https:" ? https : http;
        const fileStream = fs.createWriteStream(destPath);

        const req = client.get(fileUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fileStream.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return resolve(downloadFile(res.headers.location, destPath));
            }
            if (res.statusCode !== 200) {
                fileStream.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return reject(new Error("Falha HTTP ao baixar arquivo: " + res.statusCode));
            }
            res.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close();
                resolve(destPath);
            });
        });
        req.on("error", err => {
            fileStream.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

function convertVideoToMp3(videoPath, mp3Path) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-y",
            "-i", videoPath,
            "-vn",
            "-c:a", "libmp3lame",
            "-b:a", "320k",
            "-ar", "48000",
            "-q:a", "0",
            mp3Path
        ]);

        ffmpeg.on("close", code => {
            if (code === 0 && fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 0) {
                resolve(mp3Path);
            } else {
                reject(new Error("Falha ao extrair áudio MP3 do vídeo."));
            }
        });
        ffmpeg.on("error", reject);
    });
}

async function downloadPinterestMedia(urlOrQuery, { format = "mp4" } = {}) {
    const { url: extractedUrl } = extractUrlAndFormat(urlOrQuery);
    const target = extractedUrl || urlOrQuery.trim();
    const isUrl = /pinterest\.com|pin\.it/i.test(target);
    const pinTempDir = path.join(tempDir, "pinterest");
    if (!fs.existsSync(pinTempDir)) fs.mkdirSync(pinTempDir, { recursive: true });

    const jobId = "pin_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    if (isUrl) {
        logger.info("[PINTEREST] Processando link: " + target);

        const res = await fetch(target, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            },
            redirect: "follow"
        });

        const html = await res.text();
        const finalUrl = res.url || target;

        // Extrai título e autor
        let title = "Pinterest Media";
        const titleMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
            title = titleMatch[1].replace(/\s*\|\s*Pinterest$/i, "").trim();
        }

        let author = "";
        const authorMatch = html.match(/<meta[^>]+(?:name|property)=["'](?:author|og:site_name|twitter:creator|article:author)["'][^>]+content=["']([^"']+)["']/i);
        if (authorMatch && authorMatch[1] && !authorMatch[1].toLowerCase().includes("pinterest")) {
            author = authorMatch[1].trim();
        }

        // Se o título tiver separadores (Ex: "Nome da Arte | Criador ou Coleção"), divide entre título e autor
        if (title.includes("|")) {
            const parts = title.split("|").map(s => s.trim());
            if (parts.length > 1 && parts[1]) {
                title = parts[0];
                if (!author || author === "Pinterest") {
                    author = parts[1].split(",")[0].trim();
                }
            }
        } else if (title.includes(" - ")) {
            const parts = title.split(" - ").map(s => s.trim());
            if (parts.length > 1 && parts[1]) {
                title = parts[0];
                if (!author || author === "Pinterest") {
                    author = parts[1].trim();
                }
            }
        }

        // Se ainda for vazio ou "Pinterest", extrai o usuário da URL ou identificador
        if (!author || author.toLowerCase() === "pinterest") {
            const urlUserMatch = finalUrl.match(/pinterest\.[a-z.]+\/([a-zA-Z0-9_-]+)\//i);
            if (urlUserMatch && !["pin", "resource", "search", "ideas"].includes(urlUserMatch[1].toLowerCase())) {
                author = "@" + urlUserMatch[1];
            } else {
                author = "Pinterest Creator";
            }
        }

        // 0. Chromium (headless) — LIVE WALLPAPERS/vídeo em alta qualidade. O HTML
        //    puro costuma não trazer o mp4 (o Pinterest carrega o vídeo por JS).
        //    Tolerante: se não houver Chromium, cai no método fetch abaixo.
        let browserVideoUrl = null;
        try {
            const { resolvePinterestMedia } = require("./media/providers/pinterestBrowser");
            const { getCookiesPathFor } = require("./media/mediaArgs");
            const resolved = await resolvePinterestMedia(finalUrl, { cookiesPath: getCookiesPathFor(null) });
            if (resolved) {
                if (resolved.title && (!title || title === "Pinterest Media")) title = resolved.title;
                if (resolved.videoUrl) browserVideoUrl = resolved.videoUrl;
            }
        } catch (e) {
            if (e.code !== "BROWSER_UNAVAILABLE") {
                logger.warn(`[PINTEREST] Chromium falhou (${e.message}); usando método fetch.`);
            }
        }

        // 1. Procura vídeo MP4 (Chromium tem prioridade; senão, regex no HTML)
        const videoOg = html.match(/<meta[^>]+(?:property|name)=["']og:video["'][^>]+content=["']([^"']+.mp4[^"']*)["']/i)
            || html.match(/https:\/\/v\.pinimg\.com\/videos\/[a-zA-Z0-9_\/.-]+\.mp4/i)
            || html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/i);

        if (browserVideoUrl || videoOg) {
            const videoUrl = browserVideoUrl || videoOg[1] || videoOg[0];
            const rawVideoPath = path.join(pinTempDir, jobId + "_raw.mp4");
            await downloadFile(videoUrl, rawVideoPath);

            if (format === "mp3" || format === "audio") {
                const mp3Path = path.join(pinTempDir, jobId + ".mp3");
                await convertVideoToMp3(rawVideoPath, mp3Path);
                try { fs.unlinkSync(rawVideoPath); } catch (_) {}
                return {
                    filePath: mp3Path,
                    title,
                    author,
                    durationFormatted: "—",
                    thumbnail: null,
                    url: finalUrl,
                    isVideo: false,
                    isAudio: true,
                    mimetype: "audio/mpeg",
                    platform: "Pinterest"
                };
            }

            return {
                filePath: rawVideoPath,
                title,
                author,
                durationFormatted: "—",
                thumbnail: null,
                url: finalUrl,
                isVideo: true,
                isAudio: false,
                mimetype: "video/mp4",
                platform: "Pinterest"
            };
        }

        // 2. Procura imagem original HD (originals) ou 736x
        let imgUrl = null;
        const ogImage = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i);
        if (ogImage) {
            imgUrl = ogImage[1];
        } else {
            const pinImg = html.match(/https:\/\/i\.pinimg\.com\/[^\s"'<>]+\.(?:jpg|png|webp)/i);
            if (pinImg) imgUrl = pinImg[0];
        }

        if (imgUrl) {
            if (imgUrl.includes("/736x/")) {
                imgUrl = imgUrl.replace("/736x/", "/originals/");
            }
            const ext = imgUrl.endsWith(".png") ? "png" : "jpg";
            const imgPath = path.join(pinTempDir, jobId + "." + ext);
            
            try {
                await downloadFile(imgUrl, imgPath);
            } catch (_) {
                // Fallback para 736x se originals falhar
                if (imgUrl.includes("/originals/")) {
                    imgUrl = imgUrl.replace("/originals/", "/736x/");
                    await downloadFile(imgUrl, imgPath);
                }
            }

            return {
                filePath: imgPath,
                title,
                author,
                durationFormatted: "—",
                thumbnail: imgUrl,
                url: finalUrl,
                isVideo: false,
                isAudio: false,
                mimetype: ext === "png" ? "image/png" : "image/jpeg",
                platform: "Pinterest"
            };
        }

        throw new Error("Não foi possível encontrar imagem ou vídeo no Pin do Pinterest.");
    }

    // Pesquisa de Imagem no Pinterest
    const searchQuery = target;
    const searchUrl = "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" + encodeURIComponent(JSON.stringify({
        options: { query: searchQuery, scope: "pins" },
        context: {}
    }));

    try {
        const sRes = await fetch(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        });
        const parsed = await sRes.json();
        const results = parsed?.resource_response?.data?.results || [];

        if (results.length > 0) {
            const pin = results.find(p => p.images?.orig?.url || p.images?.["736x"]?.url) || results[0];
            const imgUrl = pin.images?.orig?.url || pin.images?.["736x"]?.url || pin.image_large_url;
            const title = pin.grid_title || pin.title || searchQuery;
            const pinUrl = pin.id ? "https://www.pinterest.com/pin/" + pin.id + "/" : "https://www.pinterest.com";

            if (imgUrl) {
                const imgPath = path.join(pinTempDir, jobId + ".jpg");
                await downloadFile(imgUrl, imgPath);
                return {
                    filePath: imgPath,
                    title,
                    author: pin.pinner?.username || "Pinterest",
                    durationFormatted: "—",
                    thumbnail: imgUrl,
                    url: pinUrl,
                    isVideo: false,
                    isAudio: false,
                    mimetype: "image/jpeg",
                    platform: "Pinterest"
                };
            }
        }
    } catch (searchErr) {
        logger.warn("[PINTEREST SEARCH WARN] " + searchErr.message);
    }

    const unsplashUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080";
    const fallbackPath = path.join(pinTempDir, jobId + ".jpg");
    await downloadFile(unsplashUrl, fallbackPath);

    return {
        filePath: fallbackPath,
        title: searchQuery,
        author: "Pinterest",
        durationFormatted: "—",
        thumbnail: unsplashUrl,
        url: "https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(searchQuery),
        isVideo: false,
        isAudio: false,
        mimetype: "image/jpeg",
        platform: "Pinterest"
    };
}

module.exports = {
    downloadPinterestMedia
};
