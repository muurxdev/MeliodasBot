/**
 * Audio Stream & High Fidelity Audio Service
 * Download e extração de áudios em MP3 320 kbps Master Studio sem distorção ou slow
 */

const play = require("play-dl");
const https = require("https");
const yts = require("yt-search");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { tempDir } = require("../config/paths");
const { getPlatformDisplayName } = require("./media/formatResolver");
const { downloadYouTubeResilient, resolveYouTubeOEmbed } = require("./media/youtubeFallback");
const { buildYtDlpArgs, getYtDlpEnv } = require("./media/mediaArgs");
const { toMessage: mediaErrorMessage } = require("./media/mediaErrors");
const logger = require("../core/logger");

let scInitialized = false;

async function initSoundCloud() {
    try {
        const clientId = await play.getFreeClientID();
        if (clientId) {
            play.setToken({ soundcloud: { client_id: clientId } });
            scInitialized = true;
            logger.info("[AUDIO STREAM] SoundCloud client_id inicializado.");
        }
    } catch (err) {
        logger.warn("[AUDIO STREAM] SoundCloud token init warn:", err.message);
    }
}

/**
 * Converte stream de áudio para MP3 320 kbps via ffmpeg
 */
function streamToMp3(inputStream, outputPath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-i", "pipe:0",
            "-vn",
            "-c:a", "libmp3lame",
            "-b:a", "320k",
            "-ar", "44100",
            "-ac", "2",
            "-avoid_negative_ts", "make_zero",
            "-y",
            outputPath
        ]);

        inputStream.pipe(ffmpeg.stdin);

        let stderr = "";
        ffmpeg.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        ffmpeg.on("close", (code) => {
            if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                resolve(outputPath);
            } else {
                reject(new Error(`FFmpeg falhou ao processar áudio (code: ${code}): ${stderr.slice(-200)}`));
            }
        });

        ffmpeg.on("error", (err) => {
            reject(new Error(`Erro ao iniciar FFmpeg: ${err.message}`));
        });

        inputStream.on("error", (err) => {
            ffmpeg.kill();
            reject(new Error(`Erro na leitura do stream de áudio: ${err.message}`));
        });
    });
}

/**
 * Detecta se um título contém modificadores indesejados (slowed, reverb, sped up)
 */
function hasUndesiredModifier(title, query) {
    const lowerTitle = (title || "").toLowerCase();
    const lowerQuery = (query || "").toLowerCase();
    const badWords = ["slowed", "slow", "reverb", "sped up", "speed up", "nightcore", "8d audio", "pitched", "slow version"];
    for (const bad of badWords) {
        if (lowerTitle.includes(bad) && !lowerQuery.includes(bad)) {
            return true;
        }
    }
    return false;
}

/**
 * Extrai metadados completos de links do YouTube / YouTube Music
 */
async function resolveYouTubeMetadata(url) {
    const oembed = await resolveYouTubeOEmbed(url);
    if (oembed && oembed.title && oembed.title !== "Vídeo do YouTube") {
        return oembed;
    }

    const idMatch = url.match(/(?:v=|\/|youtu\.be\/|watch\?v=)([0-9A-Za-z_-]{11})/);
    if (!idMatch) return null;

    const videoId = idMatch[1];
    const officialThumb = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
    const standardUrl = "https://www.youtube.com/watch?v=" + videoId;

    try {
        const r = await yts({ videoId });
        if (r && r.title) {
            return {
                title: r.title,
                author: r.author?.name || "YouTube",
                thumbnail: r.thumbnail || officialThumb,
                durationFormatted: r.timestamp || "—",
                url: r.url || standardUrl
            };
        }
    } catch (_) {}

    return {
        title: "Áudio do YouTube",
        author: "YouTube",
        thumbnail: officialThumb,
        durationFormatted: "—",
        url: standardUrl
    };
}

/**
 * Extrai metadados completos de faixas do Spotify (oEmbed + Embed Scraping)
 */
async function resolveSpotifyMetadata(url) {
    let title = "";
    let author = "";
    let durationFormatted = "";
    let thumbnail = "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600";

    const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    const trackId = trackIdMatch ? trackIdMatch[1] : null;

    if (trackId) {
        try {
            const embedUrl = "https://open.spotify.com/embed/track/" + trackId;
            const embedRes = await fetch(embedUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
                signal: AbortSignal.timeout(6000)
            });
            if (embedRes.ok) {
                const html = await embedRes.text();
                const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
                if (nextMatch) {
                    const data = JSON.parse(nextMatch[1]);
                    const entity = data.props?.pageProps?.state?.data?.entity;
                    if (entity) {
                        title = entity.name || "";
                        author = entity.artists?.map(a => a.name).join(", ") || "";
                        const durMs = entity.duration || 0;
                        if (durMs > 0) {
                            const sec = Math.round(durMs / 1000);
                            durationFormatted = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
                        }
                        if (entity.visualIdentity?.image?.[0]?.url) {
                            thumbnail = entity.visualIdentity.image[0].url;
                        }
                    }
                }
            }
        } catch (_) {}
    }

    if (!title) {
        try {
            const oembedUrl = "https://open.spotify.com/oembed?url=" + encodeURIComponent(url);
            const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
            if (oembedRes.ok) {
                const data = await oembedRes.json();
                title = data.title || "Música do Spotify";
                thumbnail = data.thumbnail_url || thumbnail;
            }
        } catch (_) {}
    }

    return {
        title: title || "Música do Spotify",
        author: author || "Spotify",
        durationFormatted: durationFormatted || "—",
        thumbnail,
        url,
        searchTerm: (title && author) ? (author + " - " + title) : (title || url)
    };
}

/**
 * Baixa áudio diretamente via yt-dlp usando PO-Token e argumentos centralizados
 */
function downloadDirectYtDlpAudio(targetUrl, outputPath) {
    return new Promise((resolve, reject) => {
        const baseArgs = buildYtDlpArgs([
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "--no-playlist",
            "--no-warnings",
            "-o", outputPath,
            targetUrl
        ]);

        const proc = spawn("yt-dlp", baseArgs, {
            env: getYtDlpEnv()
        });

        let stderrData = "";
        proc.stderr.on("data", d => { stderrData += d.toString(); });

        proc.on("close", code => {
            if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                resolve(outputPath);
            } else {
                const friendlyMsg = mediaErrorMessage("Falha ao baixar áudio do YouTube", stderrData);
                reject(new Error(friendlyMsg));
            }
        });
        proc.on("error", reject);
    });
}

/**
 * Pesquisa e baixa áudio de alta fidelidade convertido para MP3 320 kbps Studio Master
 * @param {string} query - Nome da música ou URL direta
 * @returns {Promise<object>}
 */
async function searchAndDownloadAudio(query) {
    const startedAt = Date.now();
    const jobId = "audio_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const audioTempDir = path.join(tempDir, "audio");
    if (!fs.existsSync(audioTempDir)) {
        fs.mkdirSync(audioTempDir, { recursive: true });
    }

    const outputPath = path.join(audioTempDir, jobId + ".mp3");
    const isDirectUrl = /^https?:\/\//i.test(query.trim());
    const isSpotify = /spotify\.com/i.test(query.trim());
    const platform = isSpotify ? "Spotify" : getPlatformDisplayName(query);

    let title = "Música";
    let author = "Artista";
    let durationFormatted = "—";
    let thumbnail = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600";
    let sourceUrl = query.trim();
    let searchTerm = query.trim();

    // 1. CASO SPOTIFY
    if (isSpotify) {
        const spMeta = await resolveSpotifyMetadata(query.trim());
        title = spMeta.title;
        author = spMeta.author;
        durationFormatted = spMeta.durationFormatted;
        thumbnail = spMeta.thumbnail;
        sourceUrl = spMeta.url;
        searchTerm = spMeta.searchTerm || (title + " " + author);
    }
    // 2. CASO URL DIRETA (YouTube, YouTube Music, etc.)
    else if (isDirectUrl) {
        if (/youtu(\.be|be\.com)/i.test(query)) {
            const ytMeta = await resolveYouTubeMetadata(query);
            if (ytMeta) {
                title = ytMeta.title;
                author = ytMeta.author;
                durationFormatted = ytMeta.durationFormatted;
                thumbnail = ytMeta.thumbnail;
                sourceUrl = ytMeta.url;
                searchTerm = title + " " + author;
            }
        }

        // 2.1 Tenta baixar diretamente do link original via yt-dlp
        try {
            await downloadDirectYtDlpAudio(sourceUrl, outputPath);
            return {
                filePath: outputPath,
                elapsedMs: Date.now() - startedAt,
                title,
                author,
                durationFormatted,
                thumbnail,
                url: sourceUrl,
                isVideo: false,
                isAudio: true,
                mimetype: "audio/mpeg",
                platform,
                jobId
            };
        } catch (ytDlpErr) {
            logger.warn("[AUDIO DIRECT DOWNLOAD WARN] " + ytDlpErr.message + ", tentando fallback resiliente...");

            if (/youtu(\.be|be\.com)/i.test(sourceUrl)) {
                try {
                    const ok = await downloadYouTubeResilient(sourceUrl, outputPath, "mp3");
                    if (ok && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        return {
                            filePath: outputPath,
                elapsedMs: Date.now() - startedAt,
                            title,
                            author,
                            durationFormatted,
                            thumbnail,
                            url: sourceUrl,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform,
                            jobId
                        };
                    }
                } catch (_) {}
            }
        }
    }

    // 3. BUSCA UNIVERSAL NO YOUTUBE (yt-search + yt-dlp + Fallback Resiliente)
    try {
        const searchResults = await yts(searchTerm);
        if (searchResults && Array.isArray(searchResults.videos) && searchResults.videos.length > 0) {
            // Filtra descartando vídeos < 30s ou > 900s e descartando slowed/nightcore caso não solicitados
            const fullVideos = searchResults.videos.filter(v => (v.seconds && v.seconds >= 30 && v.seconds <= 900) || !v.seconds);
            const cleanVideos = fullVideos.filter(v => !hasUndesiredModifier(v.title, query));
            const selectedVideo = cleanVideos[0] || fullVideos[0] || searchResults.videos[0];

            if (selectedVideo) {
                const ytUrl = selectedVideo.url || `https://www.youtube.com/watch?v=${selectedVideo.videoId}`;
                if (!isSpotify) {
                    title = selectedVideo.title || title;
                    author = selectedVideo.author?.name || author;
                    durationFormatted = selectedVideo.timestamp || durationFormatted;
                    thumbnail = selectedVideo.thumbnail || thumbnail;
                    sourceUrl = ytUrl;
                }

                logger.info(`[AUDIO SEARCH YT] Selecionado: "${selectedVideo.title}" (${ytUrl})`);

                // 3.1 Tentativa com yt-dlp com PO-Token
                try {
                    await downloadDirectYtDlpAudio(ytUrl, outputPath);
                    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        return {
                            filePath: outputPath,
                elapsedMs: Date.now() - startedAt,
                            title,
                            author,
                            durationFormatted,
                            thumbnail,
                            url: isSpotify ? query.trim() : sourceUrl,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform: isSpotify ? "Spotify" : "YouTube",
                            jobId
                        };
                    }
                } catch (errYt) {
                    logger.warn(`[AUDIO YT-DLP WARN] ${errYt.message}, acionando fallback resiliente...`);
                }

                // 3.2 Tentativa com Fallback Resiliente (loader.to / cobalt / yt1s)
                try {
                    const ok = await downloadYouTubeResilient(ytUrl, outputPath, "mp3");
                    if (ok && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        return {
                            filePath: outputPath,
                elapsedMs: Date.now() - startedAt,
                            title,
                            author,
                            durationFormatted,
                            thumbnail,
                            url: isSpotify ? query.trim() : sourceUrl,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform: isSpotify ? "Spotify" : "YouTube",
                            jobId
                        };
                    }
                } catch (errRes) {
                    logger.warn(`[AUDIO RESILIENT WARN] ${errRes.message}`);
                }
            }
        }
    } catch (ytSearchErr) {
        logger.warn(`[AUDIO YT SEARCH WARN] ${ytSearchErr.message}`);
    }

    // 4. FALLBACK EM SOUNDCLOUD
    if (!scInitialized) {
        await initSoundCloud();
    }

    try {
        let scResults = await play.search(searchTerm, { source: { soundcloud: "tracks" }, limit: 25 });
        if (scResults && scResults.length > 0) {
            const fullTracks = scResults.filter(t => t.durationInSec && t.durationInSec > 45 && t.durationInSec < 700);
            const cleanTracks = fullTracks.filter(t => !hasUndesiredModifier(t.name || t.title, query));
            const selectedTrack = cleanTracks[0] || fullTracks[0] || scResults[0];

            if (selectedTrack) {
                const stream = await play.stream(selectedTrack.url);
                await streamToMp3(stream.stream, outputPath);

                const finalDuration = (durationFormatted && durationFormatted !== "—")
                    ? durationFormatted
                    : (selectedTrack.durationInSec ? Math.floor(selectedTrack.durationInSec / 60) + ":" + String(selectedTrack.durationInSec % 60).padStart(2, "0") : "—");

                return {
                    filePath: outputPath,
                elapsedMs: Date.now() - startedAt,
                    title: isSpotify ? title : (selectedTrack.name || title),
                    author: isSpotify ? author : (selectedTrack.user?.name || author),
                    durationFormatted: finalDuration,
                    thumbnail: (thumbnail && !thumbnail.includes("unsplash")) ? thumbnail : (selectedTrack.artwork_url ? selectedTrack.artwork_url.replace("-large", "-t500x500") : thumbnail),
                    url: isSpotify ? query.trim() : (sourceUrl || selectedTrack.url),
                    isVideo: false,
                    isAudio: true,
                    mimetype: "audio/mpeg",
                    platform: isSpotify ? "Spotify" : (platform || "SoundCloud"),
                    jobId
                };
            }
        }
    } catch (scErr) {
        logger.error("[SOUNDCLOUD SEARCH/STREAM ERROR]", scErr);
    }

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error("Não foi possível encontrar nem processar o áudio desta faixa.");
    }

    return {
        filePath: outputPath,
                elapsedMs: Date.now() - startedAt,
        title,
        author,
        durationFormatted,
        thumbnail,
        url: sourceUrl,
        isVideo: false,
        isAudio: true,
        mimetype: "audio/mpeg",
        platform,
        jobId
    };
}

/**
 * Detecta e resolve todas as faixas de uma Playlist ou Álbum (Spotify, YouTube, SoundCloud)
 */
async function resolvePlaylistTracks(url) {
    if (!url || typeof url !== "string") return null;
    const cleanUrl = url.trim();

    // 1. SPOTIFY PLAYLIST / ALBUM
    const spotifyPlaylistMatch = cleanUrl.match(/open\.spotify\.com\/(playlist|album)\/([a-zA-Z0-9]+)/i);
    if (spotifyPlaylistMatch) {
        const type = spotifyPlaylistMatch[1];
        const id = spotifyPlaylistMatch[2];
        try {
            const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
            const res = await fetch(embedUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
                signal: AbortSignal.timeout(8000)
            });
            if (res.ok) {
                const html = await res.text();
                const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
                if (nextMatch) {
                    const data = JSON.parse(nextMatch[1]);
                    const entity = data.props?.pageProps?.state?.data?.entity;
                    if (entity && Array.isArray(entity.trackList) && entity.trackList.length > 0) {
                        const tracks = entity.trackList.map(t => {
                            const trackTitle = t.title || "Música";
                            const trackArtist = t.subtitle || entity.name || "Spotify";
                            const durSec = t.duration ? Math.round(t.duration / 1000) : 0;
                            const durStr = durSec > 0 ? (Math.floor(durSec / 60) + ":" + String(durSec % 60).padStart(2, "0")) : "—";
                            return {
                                title: trackTitle,
                                author: trackArtist,
                                searchTerm: `${trackArtist} - ${trackTitle}`,
                                duration: durStr,
                                url: cleanUrl
                            };
                        });

                        return {
                            isPlaylist: true,
                            title: entity.name || (type === "album" ? "Álbum do Spotify" : "Playlist do Spotify"),
                            platform: "Spotify",
                            type: type === "album" ? "Álbum" : "Playlist",
                            total: tracks.length,
                            tracks
                        };
                    }
                }
            }
        } catch (err) {
            logger.warn(`[SPOTIFY PLAYLIST RESOLVER WARN] ${err.message}`);
        }
    }

    // 2. YOUTUBE PLAYLIST (yt-dlp flat-playlist)
    const ytListMatch = cleanUrl.match(/[?&]list=([0-9A-Za-z_-]+)/i) || cleanUrl.match(/youtube\.com\/playlist\?list=([0-9A-Za-z_-]+)/i);
    if (ytListMatch) {
        try {
            const listJson = await new Promise((resolve, reject) => {
                const baseArgs = buildYtDlpArgs([
                    "--flat-playlist",
                    "-J",
                    "--no-warnings",
                    cleanUrl
                ]);
                const proc = spawn("yt-dlp", baseArgs, { env: getYtDlpEnv() });
                let data = "";
                proc.stdout.on("data", d => { data += d.toString(); });
                proc.on("close", code => {
                    if (code === 0 && data) {
                        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                    } else {
                        reject(new Error("Falha ao extrair playlist"));
                    }
                });
                proc.on("error", reject);
            });

            if (listJson && Array.isArray(listJson.entries) && listJson.entries.length > 0) {
                const tracks = listJson.entries.map(e => {
                    const durSec = Number(e.duration || 0);
                    const durStr = durSec > 0 ? (Math.floor(durSec / 60) + ":" + String(durSec % 60).padStart(2, "0")) : "—";
                    return {
                        title: e.title || "Faixa do YouTube",
                        author: e.uploader || e.channel || "YouTube",
                        searchTerm: e.url || (e.id ? `https://www.youtube.com/watch?v=${e.id}` : e.title),
                        duration: durStr,
                        url: e.url || (e.id ? `https://www.youtube.com/watch?v=${e.id}` : cleanUrl)
                    };
                });

                return {
                    isPlaylist: true,
                    title: listJson.title || "Playlist do YouTube",
                    platform: "YouTube",
                    type: "Playlist",
                    total: tracks.length,
                    tracks
                };
            }
        } catch (err) {
            logger.warn(`[YOUTUBE PLAYLIST RESOLVER WARN] ${err.message}`);
        }
    }

    return null;
}

module.exports = {
    searchAndDownloadAudio,
    resolvePlaylistTracks,
    resolveSpotifyMetadata,
    resolveYouTubeMetadata
};
