/**
 * YouTube Anti-Bot Resilient Fallback Engine v3
 * Estratégia: RACE paralelo entre múltiplas APIs — pega a primeira que responder
 * Sem esperar falhar uma por uma → muito mais rápido
 */

const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const logger = require("../../core/logger");

function extractYouTubeVideoId(input) {
    if (!input || typeof input !== "string") return null;
    const match = input.match(/(?:v=|\/|youtu\.be\/|watch\?v=|shorts\/|live\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
}

/**
 * Resolve metadados via YouTube oEmbed (rápido, sem yt-dlp, sem anti-bot)
 */
async function resolveYouTubeOEmbed(url) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const { getBestYouTubeThumbnail } = require('./thumbnailResolver');
    const officialThumb = await getBestYouTubeThumbnail(videoId);

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;
        const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            return {
                id: videoId,
                title: data.title || "Vídeo do YouTube",
                author: data.author_name || "YouTube",
                thumbnail: officialThumb,
                url: standardUrl,
                durationFormatted: "—"
            };
        }
    } catch (err) {
        logger.warn(`[YOUTUBE OEMBED WARN] ${err.message}`);
    }

    return { id: videoId, title: "Vídeo do YouTube", author: "YouTube", thumbnail: officialThumb, url: standardUrl, durationFormatted: "—" };
}

function streamToFile(fileUrl, destPath) {
    return new Promise((resolve, reject) => {
        const u = new URL(fileUrl);
        const client = u.protocol === "https:" ? https : http;
        const fileStream = fs.createWriteStream(destPath);

        const req = client.get(fileUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "identity"
            }
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fileStream.close();
                try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) {}
                return resolve(streamToFile(res.headers.location, destPath));
            }
            if (res.statusCode !== 200) {
                fileStream.close();
                try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) {}
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let totalBytes = 0;
            res.on("data", chunk => { totalBytes += chunk.length; });
            res.pipe(fileStream);
            fileStream.on("finish", () => { fileStream.close(); resolve(destPath); });
            fileStream.on("error", err => { fileStream.close(); try { fs.unlinkSync(destPath); } catch(_){} reject(err); });
        });

        req.on("error", err => {
            fileStream.close();
            try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) {}
            reject(err);
        });

        req.setTimeout(90000, () => { req.destroy(); reject(new Error("Stream timeout")); });
    });
}

/**
 * Tenta cobalt.tools — retorna URL direta instantaneamente (sem polling)
 */
async function tryCobalt(videoId, format) {
    const instances = [
        "https://api.cobalt.tools",
        "https://cobalt.drgns.space",
        "https://cobalt.api.timeless.ovh",
        "https://cob.frootlab.xyz"
    ];
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const body = JSON.stringify({
        url,
        videoQuality: format === "mp3" ? "144" : "2160",
        audioFormat: format === "mp3" ? "mp3" : "best",
        downloadMode: format === "mp3" ? "audio" : "auto",
        youtubeVideoCodec: "h264"
    });
    for (const inst of instances) {
        try {
            const r = await fetch(`${inst}/`, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body,
                signal: AbortSignal.timeout(6000)
            });
            if (r.ok) {
                const d = await r.json();
                if (d && (d.status === "redirect" || d.status === "tunnel" || d.status === "stream") && d.url) return d.url;
                if (d && d.url) return d.url;
            }
        } catch (_) {}
    }
    return null;
}

/**
 * Tenta API Yt1s/SaveTube — variante sem polling
 */
async function tryYt1s(videoId, format) {
    try {
        const analyzeRes = await fetch("https://yt1s.com/api/ajaxSearch/index", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `q=https://www.youtube.com/watch?v=${videoId}&vt=${format === "mp3" ? "mp3" : "mp4"}`,
            signal: AbortSignal.timeout(8000)
        });
        if (!analyzeRes.ok) return null;
        const data = await analyzeRes.json();
        if (!data.links) return null;

        const category = format === "mp3" ? data.links.mp3 : data.links.mp4;
        if (!category) return null;

        // Pega melhor qualidade
        const best = Object.entries(category)
            .filter(([k, v]) => v && v.size && v.size !== "0B")
            .sort(([, a], [, b]) => {
                const qa = parseInt(a.q || 0);
                const qb = parseInt(b.q || 0);
                return qb - qa;
            })[0];

        if (!best) return null;
        const [, item] = best;

        const convRes = await fetch("https://yt1s.com/api/ajaxConvert/convert", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `vid=${videoId}&k=${item.k}`,
            signal: AbortSignal.timeout(10000)
        });
        if (!convRes.ok) return null;
        const convData = await convRes.json();
        return convData.dlink || null;
    } catch (_) { return null; }
}

/**
 * Tenta loader.to com polling acelerado (máx ~15s) como fallback final
 */
async function tryLoaderTo(videoId, format) {
    const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const targetFmt = format === "mp3" ? "mp3" : "1080";
    try {
        const initUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${targetFmt}&url=${encodeURIComponent(standardUrl)}`;
        const initRes = await fetch(initUrl, { signal: AbortSignal.timeout(8000) });
        if (!initRes.ok) return null;
        const initData = await initRes.json();
        if (!initData.id) return null;

        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 500));
            try {
                const p = await fetch(`https://loader.to/ajax/progress.php?id=${initData.id}`, { signal: AbortSignal.timeout(3000) });
                if (p.ok) {
                    const pd = await p.json();
                    if (pd.download_url && pd.download_url.trim()) return pd.download_url.trim();
                }
            } catch (_) {}
        }
    } catch (_) {}
    return null;
}

/**
 * Motor resiliente: race paralelo entre APIs — pega a primeira que responder
 * @param {string} url
 * @param {string} destPath
 * @param {'mp4'|'mp3'} format
 * @returns {Promise<boolean>}
 */
async function downloadYouTubeResilient(url, destPath, format = "mp4") {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return false;

    const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
    logger.info(`[YOUTUBE RESILIENT] Iniciando race paralelo (${format}) para ${standardUrl}...`);

    // Garante diretório
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Race paralelo: primeira API a retornar URL direta ganha
    const raceDirectUrl = () => new Promise(async (resolveRace) => {
        let won = false;
        const win = (url, name) => {
            if (!won) { won = true; logger.info(`[YOUTUBE RESILIENT] ✅ Race vencido por: ${name}`); resolveRace({ url, name }); }
        };

        const strategies = [
            tryCobalt(videoId, format).then(u => u && win(u, "cobalt")),
            tryYt1s(videoId, format).then(u => u && win(u, "yt1s")),
            // loader.to tem polling interno, inicia ligeiramente atrasado
            new Promise(r => setTimeout(r, 200)).then(() => tryLoaderTo(videoId, format)).then(u => u && win(u, "loader.to"))
        ];

        await Promise.allSettled(strategies);
        if (!won) resolveRace(null);
    });

    try {
        const result = await raceDirectUrl();
        if (!result || !result.url) {
            logger.warn("[YOUTUBE RESILIENT] Todas as APIs falharam.");
            return false;
        }

        logger.info(`[YOUTUBE RESILIENT] Baixando via ${result.name}...`);
        await streamToFile(result.url, destPath);

        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
            logger.info(`[YOUTUBE RESILIENT] ✅ Download completo: ${(fs.statSync(destPath).size / 1024 / 1024).toFixed(2)} MB via ${result.name}`);
            return true;
        }
    } catch (err) {
        logger.error(`[YOUTUBE RESILIENT ERROR] ${err.message}`);
    }

    return false;
}

module.exports = {
    extractYouTubeVideoId,
    resolveYouTubeOEmbed,
    downloadYouTubeResilient
};
