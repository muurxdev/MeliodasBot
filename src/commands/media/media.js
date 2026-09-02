/**
 * MeliodasBot — Comando Central .media / .video / .play
 * Central unificada de download inteligente de vídeos, músicas e playlists de toda a web
 */

const fs = require("fs");
const path = require("path");
const { downloadTikTokVideo } = require("../../services/media/providers/tiktok");
const { downloadTwitterVideo } = require("../../services/media/providers/twitter");
const { downloadKwaiVideo } = require("../../services/media/providers/kwai");
const { downloadPinterestMedia } = require("../../services/pinterestService");
const { searchAndDownloadAudio, resolvePlaylistTracks } = require("../../services/audioStreamService");
const { extractMetadata, downloadMedia, looksLikeUrl } = require("../../services/mediaEngine");
const { getPlatformDisplayName, formatMediaCaption } = require("../../services/media/formatResolver");
const { mediaQueue } = require("../../services/mediaQueue");
const { extractUrlAndFormat } = require("../../services/media/urlExtractor");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "media",
    aliases: ["download", "dl", "baixar", "baixarmidia", "mp4", "video", "baixarvideo", "mp3", "playmp3"],
    category: "media",
    description: "Central inteligente de download de mídias e playlists de toda a Web (YouTube, Spotify, Kwai, TikTok, Twitter/X, Pinterest, Instagram)",
    cooldownMs: 3000,
    execute: async ({ sender, text, reply, client, from, info, quotedText, commandName }) => {
        const botName = getBotName();
        const rawInput = (text || quotedText || "").trim();

        if (!rawInput) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║   📥 *MELIODAS MEDIA HUB* 📥   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "╭━〔 🎬 COMO BAIXAR MÍDIAS DA WEB 〕━⬣\n";
            doc += "┃ 🎥 *Vídeo MP4:* `.media mp4 <link>` ou `.video <link>`\n";
            doc += "┃ 🎵 *Áudio MP3:* `.media mp3 <link>` ou `.play <nome/link>`\n";
            doc += "┃ 📂 *Playlists:* `.media <link de playlist/álbum>`\n";
            doc += "┃ 📱 *Plataformas Suportadas:*\n";
            doc += "┃   • YouTube (Vídeos, Shorts e Playlists)\n";
            doc += "┃   • Spotify (Músicas, Álbuns e Playlists)\n";
            doc += "┃   • TikTok (Sem marca d'água)\n";
            doc += "┃   • Kwai (Vídeos e Áudio)\n";
            doc += "┃   • Twitter / X (Vídeos e GIFs)\n";
            doc += "┃   • Pinterest (Fotos, Carrosséis e Vídeos)\n";
            doc += "┃   • Instagram, Reddit, SoundCloud, Facebook e Web\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            doc += "💡 *Dica:* Você também pode responder a qualquer mensagem com link digitando `.media mp3` ou `.media mp4`!\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        const isCommandMp3 = ["mp3", "playmp3"].includes(commandName?.toLowerCase());
        const isCommandMp4 = ["mp4", "video", "baixarvideo"].includes(commandName?.toLowerCase());
        const defaultFormat = isCommandMp3 ? "mp3" : (isCommandMp4 ? "mp4" : "mp4");

        const { url: cleanUrl, isMp3: hasMp3Flag, isMp4: hasMp4Flag, cleanQuery: queryWithoutFormat } = extractUrlAndFormat(rawInput, defaultFormat);
        const isMp3 = isCommandMp3 || hasMp3Flag;
        const isMp4 = isCommandMp4 || hasMp4Flag;
        const cleanQuery = cleanUrl || queryWithoutFormat;

        const isKwai = /kwai\.com|k\.kwai\.com|v\.kwai\.com|kwai-video\.com/i.test(cleanQuery);
        const isTikTok = /tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(cleanQuery);
        const isTwitter = /twitter\.com|x\.com/i.test(cleanQuery);
        const isPinterest = /pinterest\.com|pin\.it/i.test(cleanQuery);
        const platformName = getPlatformDisplayName(cleanQuery);

        // 1. SUPORTE A PLAYLISTS E ÁLBUNS COMPLETOS (Spotify & YouTube)
        if (cleanUrl) {
            const playlistInfo = await resolvePlaylistTracks(cleanUrl);
            if (playlistInfo && playlistInfo.isPlaylist && playlistInfo.tracks.length > 0) {
                const totalTracks = playlistInfo.tracks.length;
                let playlistDoc = "╔══════════════════════════════╗\n";
                playlistDoc += "║  📂 *COLEÇÃO / PLAYLIST ENCONTRADA* 📂 ║\n";
                playlistDoc += "╚══════════════════════════════╝\n\n";
                playlistDoc += "╭━〔 📋 DETALHES DO ACERVO 〕━⬣\n";
                playlistDoc += "┃ 📱 *Plataforma:* " + playlistInfo.platform + "\n";
                playlistDoc += "┃ 📂 *Título:* " + playlistInfo.title + "\n";
                playlistDoc += "┃ 📦 *Total de Faixas:* *" + totalTracks + " faixas*\n";
                playlistDoc += "┃ 🎧 *Formato:* MP3 Master Alta Fidelidade (320kbps)\n";
                playlistDoc += "┃ ⏳ *Status:* Processando download sequencial das músicas...\n";
                playlistDoc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
                playlistDoc += "👑 *" + botName + "*";

                await reply(playlistDoc.trim());

                // Processa cada música sequencialmente (limite de segurança de até 25 faixas por comando)
                const limit = Math.min(totalTracks, 25);
                for (let i = 0; i < limit; i++) {
                    const track = playlistInfo.tracks[i];
                    try {
                        const mediaData = await mediaQueue.enqueue({
                            url: track.searchTerm,
                            format: "mp3",
                            user: sender,
                            runFn: () => searchAndDownloadAudio(track.searchTerm)
                        });

                        const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                            platform: playlistInfo.platform,
                            title: `[${i + 1}/${limit}] ${mediaData.title}`,
                            author: mediaData.author,
                            durationFormatted: mediaData.durationFormatted,
                            url: mediaData.url,
                            isAudio: true
                        });

                        if (mediaData.thumbnail) {
                            try {
                                await client.sendMessage(from, { image: { url: mediaData.thumbnail }, caption }, { quoted: info });
                            } catch (_) {}
                        }

                        if (fs.existsSync(mediaData.filePath)) {
                            const audioBuffer = fs.readFileSync(mediaData.filePath);
                            await client.sendMessage(from, {
                                audio: audioBuffer,
                                mimetype: "audio/mpeg",
                                ptt: false,
                                fileName: `${mediaData.title.slice(0, 30)}.mp3`
                            }, { quoted: info });
                            try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                        }
                    } catch (trackErr) {
                        logger.warn(`[PLAYLIST TRACK ERROR] Faixa ${i + 1} (${track.title}): ${trackErr.message}`);
                    }
                }
                return logger.info(`[MEDIA HUB] Playlist "${playlistInfo.title}" (${limit} faixas) enviada para ${sender}`);
            }
        }

        // 2. PINTEREST NATIVO
        if (isPinterest) {
            await reply("📌 *Processando Pinterest...* Aguarde.");
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadPinterestMedia(cleanQuery, { format: isMp3 ? "mp3" : "mp4" })
                });

                if (mediaData.images && Array.isArray(mediaData.images) && mediaData.images.length > 1) {
                    const total = mediaData.images.length;
                    let carrosselCard = "╔══════════════════════════════╗\n";
                    carrosselCard += "║   📸 *CARROSSEL DO PINTEREST* 📸   ║\n";
                    carrosselCard += "╚══════════════════════════════╝\n\n";
                    carrosselCard += "📦 *Total de Fotos:* *" + total + " imagens HD*\n";
                    carrosselCard += "🎬 *Título:* " + mediaData.title + "\n";
                    carrosselCard += "👤 *Autor:* " + mediaData.author + "\n";
                    carrosselCard += "🔗 *Link:* " + mediaData.url + "\n\n";
                    carrosselCard += "⏳ _Enviando todas as fotos em alta resolução..._";

                    await reply(carrosselCard.trim());

                    for (let i = 0; i < total; i++) {
                        const imgUrl = mediaData.images[i];
                        try {
                            const imgRes = await fetch(imgUrl);
                            const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                            await client.sendMessage(from, {
                                image: imgBuf,
                                caption: "📸 *Item " + (i + 1) + "/" + total + "* — " + mediaData.title
                            }, { quoted: info });
                        } catch (_) {}
                    }
                    return;
                }

                const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                    platform: "Pinterest",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    isAudio: isMp3
                });

                if (mediaData.isVideo) {
                    const videoBuf = fs.readFileSync(mediaData.filePath);
                    await client.sendMessage(from, { video: videoBuf, caption, mimetype: "video/mp4" }, { quoted: info });
                } else if (mediaData.isAudio) {
                    const audioBuf = fs.readFileSync(mediaData.filePath);
                    await client.sendMessage(from, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false, fileName: mediaData.title.slice(0, 30) + ".mp3" }, { quoted: info });
                } else {
                    const imgBuf = fs.readFileSync(mediaData.filePath);
                    await client.sendMessage(from, { image: imgBuf, caption }, { quoted: info });
                }

                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                return logger.info("[MEDIA HUB] Pinterest enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB PINTEREST ERROR]", err);
                return reply("❌ *Erro no download do Pinterest:* " + err.message);
            }
        }

        // 3. KWAI NATIVO
        if (isKwai) {
            await reply(isMp3 ? "🧡 *Extraindo áudio MP3 do Kwai...* Aguarde." : "🧡 *Baixando vídeo do Kwai...* Aguarde.");
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadKwaiVideo(cleanQuery)
                });

                const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                    platform: "Kwai",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    isAudio: isMp3
                });

                if (isMp3) {
                    const { spawn } = require("child_process");
                    const mp3Out = mediaData.filePath.replace(/\.mp4$/i, ".mp3");
                    await new Promise((resolve, reject) => {
                        const ff = spawn("ffmpeg", ["-y", "-i", mediaData.filePath, "-vn", "-c:a", "libmp3lame", "-b:a", "320k", "-ar", "48000", mp3Out]);
                        ff.on("close", code => (code === 0 ? resolve() : reject(new Error("Erro na conversão MP3"))));
                        ff.on("error", reject);
                    });

                    const audioBuf = fs.readFileSync(mp3Out);
                    await client.sendMessage(from, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false, fileName: mediaData.title.slice(0, 30) + ".mp3" }, { quoted: info });
                    try { fs.unlinkSync(mp3Out); } catch (_) {}
                } else {
                    const videoBuf = fs.readFileSync(mediaData.filePath);
                    await client.sendMessage(from, { video: videoBuf, caption, mimetype: "video/mp4" }, { quoted: info });
                }

                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                return logger.info("[MEDIA HUB] Kwai enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB KWAI ERROR]", err);
                return reply("❌ *Erro no download do Kwai:* " + err.message);
            }
        }

        // 4. TIKTOK NATIVO
        if (isTikTok) {
            await reply(isMp3 ? "🖤 *Extraindo áudio MP3 do TikTok...* Aguarde." : "🖤 *Baixando TikTok sem marca d'água...* Aguarde.");
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadTikTokVideo(cleanQuery)
                });

                const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                    platform: "TikTok",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    isAudio: isMp3
                });

                if (isMp3) {
                    const { spawn } = require("child_process");
                    const mp3Out = mediaData.filePath.replace(/\.mp4$/i, ".mp3");
                    await new Promise((resolve, reject) => {
                        const ff = spawn("ffmpeg", ["-y", "-i", mediaData.filePath, "-vn", "-c:a", "libmp3lame", "-b:a", "320k", "-ar", "48000", mp3Out]);
                        ff.on("close", code => (code === 0 ? resolve() : reject(new Error("Erro na conversão MP3"))));
                        ff.on("error", reject);
                    });

                    const audioBuf = fs.readFileSync(mp3Out);
                    await client.sendMessage(from, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false, fileName: mediaData.title.slice(0, 30) + ".mp3" }, { quoted: info });
                    try { fs.unlinkSync(mp3Out); } catch (_) {}
                } else {
                    const videoBuf = fs.readFileSync(mediaData.filePath);
                    await client.sendMessage(from, { video: videoBuf, caption, mimetype: "video/mp4" }, { quoted: info });
                }

                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                return logger.info("[MEDIA HUB] TikTok enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB TIKTOK ERROR]", err);
                return reply("❌ *Erro no download do TikTok:* " + err.message);
            }
        }

        // 5. TWITTER / X NATIVO
        if (isTwitter) {
            await reply(isMp3 ? "🐦 *Extraindo áudio MP3 do Twitter / X...* Aguarde." : "🐦 *Baixando vídeo do Twitter / X...* Aguarde.");
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadTwitterVideo(cleanQuery)
                });

                const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                    platform: "Twitter (X)",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    isAudio: isMp3
                });

                if (isMp3) {
                    const { spawn } = require("child_process");
                    const mp3Out = mediaData.filePath.replace(/\.mp4$/i, ".mp3");
                    await new Promise((resolve, reject) => {
                        const ff = spawn("ffmpeg", ["-y", "-i", mediaData.filePath, "-vn", "-c:a", "libmp3lame", "-b:a", "320k", "-ar", "48000", mp3Out]);
                        ff.on("close", code => (code === 0 ? resolve() : reject(new Error("Erro na conversão MP3"))));
                        ff.on("error", reject);
                    });

                    const audioBuf = fs.readFileSync(mp3Out);
                    await client.sendMessage(from, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false, fileName: mediaData.title.slice(0, 30) + ".mp3" }, { quoted: info });
                    try { fs.unlinkSync(mp3Out); } catch (_) {}
                } else {
                    const videoBuf = fs.readFileSync(mediaData.filePath);
                    await client.sendMessage(from, { video: videoBuf, caption, mimetype: "video/mp4" }, { quoted: info });
                }

                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                return logger.info("[MEDIA HUB] Twitter enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB TWITTER ERROR]", err);
                return reply("❌ *Erro no download do Twitter / X:* " + err.message);
            }
        }

        // 6. VÍDEO (MP4) GERAL — YOUTUBE, INSTAGRAM, FACEBOOK, REDDIT, VÍDEO WEB
        const isForceAudio = isMp3 || /spotify\.com|soundcloud\.com/i.test(cleanQuery);
        const shouldDownloadVideo = (!isForceAudio) && (isMp4 || looksLikeUrl(cleanQuery));

        if (shouldDownloadVideo) {
            const { formatDownloadProgressCard, getEstimatedWaitTime } = require("../../services/media/formatResolver");
            const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");

            const initialCard = formatDownloadProgressCard({
                platform: platformName,
                isAudio: false,
                estimatedTime: '~5 a 15 seg',
                quality: '1080p Full HD'
            });
            await reply(initialCard);

            try {
                const meta = await extractMetadata(cleanQuery, { isSearch: !looksLikeUrl(cleanQuery) });
                const targetUrl = meta.webpageUrl || meta.url || cleanQuery;

                const downloaded = await mediaQueue.enqueue({
                    url: targetUrl,
                    format: "mp4",
                    user: sender,
                    runFn: () => downloadMedia({
                        source: targetUrl,
                        url: targetUrl,
                        requestedFormat: "mp4",
                        format: "mp4"
                    })
                });

                let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0]);
                if (filePath && fs.existsSync(filePath)) {
                    filePath = await ensureMobileVideoCompatibility(filePath);
                    const stats = fs.statSync(filePath);
                    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
                    const cleanTitle = (meta.title || "video").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);

                    const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                        platform: platformName,
                        title: meta.title,
                        author: meta.author,
                        durationFormatted: meta.durationFormatted,
                        url: targetUrl,
                        isAudio: false
                    });

                    const videoBuf = fs.readFileSync(filePath);

                    if (stats.size <= 100 * 1024 * 1024) {
                        await client.sendMessage(from, { video: videoBuf, caption, mimetype: "video/mp4" }, { quoted: info });
                    } else {
                        await client.sendMessage(from, {
                            document: videoBuf,
                            mimetype: "video/mp4",
                            fileName: `${cleanTitle}.mp4`,
                            caption: `${caption}\n\n📦 *Enviado como documento (${sizeMb} MB) para manter 100% da qualidade HD original.*`
                        }, { quoted: info });
                    }

                    try { fs.unlinkSync(filePath); } catch (_) {}
                    return logger.info("[MEDIA HUB] Vídeo (" + sizeMb + " MB) enviado para " + sender + ": " + meta.title);
                }
            } catch (videoErr) {
                logger.error("[MEDIA HUB VIDEO ERROR]", videoErr);
                return reply("❌ *Erro no download do vídeo:* " + videoErr.message + "\n\n💡 *Dica:* Se desejar apenas o áudio, tente `.media mp3 " + cleanQuery + "` ou `.play`");
            }
        }

        // 7. ÁUDIO MP3 DE ALTA FIDELIDADE (320 kbps)
        const { formatDownloadProgressCard } = require("../../services/media/formatResolver");
        const initialAudioCard = formatDownloadProgressCard({
            platform: platformName,
            isAudio: true,
            estimatedTime: "~5 a 12 seg"
        });
        await reply(initialAudioCard);

        try {
            const mediaData = await mediaQueue.enqueue({
                url: cleanQuery,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(cleanQuery)
            });

            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                platform: mediaData.platform || platformName,
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                isAudio: true
            });

            if (mediaData.thumbnail) {
                try {
                    await client.sendMessage(from, { image: { url: mediaData.thumbnail }, caption }, { quoted: info });
                } catch (_) {}
            }

            if (fs.existsSync(mediaData.filePath)) {
                const audioBuffer = fs.readFileSync(mediaData.filePath);
                const cleanTitle = (mediaData.title || "audio").replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
                await client.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${cleanTitle}.mp3`
                }, { quoted: info });
                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
            }

            logger.info("[MEDIA HUB] Áudio enviado para " + sender);
        } catch (err) {
            logger.error("[MEDIA HUB ERROR]", err);
            await reply("❌ *Falha no processamento da mídia:* " + err.message + "\n\n💡 *Dica:* Verifique se o link é público ou use `.play <nome da música>`.");
        }
    }
};
