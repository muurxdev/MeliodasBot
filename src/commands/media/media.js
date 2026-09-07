/**
 * Comando Central .media / .video / .play
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
const { enviarAudio } = require('../../services/media/audioSender');
const { enviarVideo } = require('../../services/media/videoSender')

module.exports = {
    name: "media",
    aliases: ["download", "dl", "baixar", "baixarmidia", "mp4", "video", "baixarvideo", "mp3"],
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

            if (process.env.NODE_ENV === 'test') {
                return reply(doc.trim());
            }

            const { sendMenuMediaMessage } = require("../../utils/wallpapers");
            return await sendMenuMediaMessage(client, from, {
                category: "media",
                text: doc,
                quoted: info
            });
        }

        const isCommandMp3 = ["mp3", "playmp3"].includes(commandName?.toLowerCase());
        const isCommandMp4 = ["mp4", "video", "baixarvideo"].includes(commandName?.toLowerCase());
        const defaultFormat = isCommandMp4 ? "mp4" : "mp3";

        const { url: cleanUrl, isMp3: hasMp3Flag, isMp4: hasMp4Flag, cleanQuery: queryWithoutFormat } = extractUrlAndFormat(rawInput, defaultFormat);
        const isMp4 = isCommandMp4 || hasMp4Flag;
        const isMp3 = isCommandMp3 || hasMp3Flag || (!isMp4);
        const cleanQuery = cleanUrl || queryWithoutFormat;

        if (client && from && info?.key) {
            try { await client.sendMessage(from, { react: { text: '⏳', key: info.key } }); } catch (_) {}
        }

        const isKwai = /kwai\.com|k\.kwai\.com|v\.kwai\.com|kwai-video\.com/i.test(cleanQuery);
        const isTikTok = /tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(cleanQuery);
        const isTwitter = /twitter\.com|x\.com/i.test(cleanQuery);
        const isPinterest = /pinterest\.com|pin\.it/i.test(cleanQuery);
        const isInstagram = /instagram\.com|instagr\.am/i.test(cleanQuery);
        const isSpotify = /spotify\.com/i.test(cleanQuery);
        const isYouTube = /youtube\.com|youtu\.be/i.test(cleanQuery);
        const isFacebook = /facebook\.com|fb\.watch/i.test(cleanQuery);
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
                playlistDoc += "┃ 🎧 *Formato:* " + (isMp4 ? "MP4 (Vídeo)" : "MP3 (alta fidelidade)") + "\n";
                playlistDoc += "┃ ⏳ *Status:* Processando download sequencial das mídias...\n";
                playlistDoc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
                playlistDoc += "👑 *" + botName + "*";

                await reply(playlistDoc.trim());

                // Processa cada música sequencialmente (teto expandido: até 500 áudios ou 250 vídeos)
                const limit = Math.min(totalTracks, isMp4 ? 250 : 500);
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
                elapsedMs: mediaData.elapsedMs,
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
                            try {
                                await enviarAudio({
                        client, from, info,
                        filePath: mediaData.filePath,
                        fileName: `${mediaData.title.slice(0, 30)}.mp3`,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                            } finally {
                                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                            }
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
                    carrosselCard += "📦 *Total de Fotos:* *" + total + " imagens em resolução original*\n";
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

                let finalFilePath = mediaData.filePath;
                if (mediaData.isVideo) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: mediaData.elapsedMs,
                    platform: "Pinterest",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    isAudio: isMp3
                });

                try {
                    if (mediaData.isVideo) {
                        const cleanTitle = (mediaData.title || "pinterest").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                        await enviarVideo({
                            client, from, filePath: finalFilePath, caption, info,
                            fileName: `${cleanTitle}.mp4`,
                            preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                        });
                    } else if (mediaData.isAudio) {
                        await enviarAudio({ client, from, info, filePath: finalFilePath, fileName: mediaData.title.slice(0, 30) + ".mp3", preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || '')) });
                    } else {
                        await client.sendMessage(from, { image: { url: finalFilePath }, caption }, { quoted: info });
                    }
                } finally {
                    try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (_) {}
                    try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (_) {}
                }
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

                let finalFilePath = mediaData.filePath;
                if (!isMp3) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: mediaData.elapsedMs,
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

                    // Card medido do ARQUIVO REALMENTE ENVIADO (o mp3 convertido) —
                    // o caption acima descreve o mp4 de origem, não o que sai daqui.
                    const captionMp3 = formatMediaCaption({
                        filePath: mp3Out,
                        elapsedMs: mediaData.elapsedMs,
                        platform: mediaData.platform || "Web",
                        title: mediaData.title,
                        author: mediaData.author,
                        durationFormatted: mediaData.durationFormatted,
                        url: mediaData.url,
                        isAudio: true
                    });
                    try {
                        await enviarAudio({ client, from, info, filePath: mp3Out, fileName: mediaData.title.slice(0, 30) + ".mp3", preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || '')) });
                        await reply(captionMp3);
                    } finally {
                        try { fs.unlinkSync(mp3Out); } catch (_) {}
                    }
                } else {
                    const cleanTitle = (mediaData.title || "kwai").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }

                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (_) {}
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (_) {}
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
                    timeoutMs: 60000,
                    runFn: () => downloadTikTokVideo(cleanQuery)
                });

                let finalFilePath = mediaData.filePath;
                if (!isMp3) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: mediaData.elapsedMs,
                    platform: "TikTok",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    uploadDate: mediaData.uploadDate,
                    year: mediaData.year,
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

                    // Card medido do ARQUIVO REALMENTE ENVIADO (o mp3 convertido) —
                    // o caption acima descreve o mp4 de origem, não o que sai daqui.
                    // Card medido do ARQUIVO REALMENTE ENVIADO (o mp3 convertido)
                    const captionMp3 = formatMediaCaption({
                        filePath: mp3Out,
                        elapsedMs: mediaData.elapsedMs,
                        platform: mediaData.platform || "Web",
                        platform: mediaData.platform || "TikTok",
                        title: mediaData.title,
                        author: mediaData.author,
                        durationFormatted: mediaData.durationFormatted,
                        url: mediaData.url,
                        uploadDate: mediaData.uploadDate,
                        year: mediaData.year,
                        audioBitrate: "320 kbps",
                        isAudio: true
                    });
                    try {
                        await enviarAudio({ client, from, info, filePath: mp3Out, fileName: mediaData.title.slice(0, 30) + ".mp3", preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || '')) });
                        await reply(captionMp3);
                    } finally {
                        try { fs.unlinkSync(mp3Out); } catch (_) {}
                    }
                } else {
                    const cleanTitle = (mediaData.title || "tiktok").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }

                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (_) {}
                }

                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (_) {}
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (_) {}
                return logger.info("[MEDIA HUB] TikTok enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB TIKTOK ERROR]", err);
                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (_) {}
                }
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

                let finalFilePath = mediaData.filePath;
                if (!isMp3) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: mediaData.elapsedMs,
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

                    // Card medido do ARQUIVO REALMENTE ENVIADO (o mp3 convertido) —
                    // o caption acima descreve o mp4 de origem, não o que sai daqui.
                    const captionMp3 = formatMediaCaption({
                        filePath: mp3Out,
                        elapsedMs: mediaData.elapsedMs,
                        platform: mediaData.platform || "Web",
                        title: mediaData.title,
                        author: mediaData.author,
                        durationFormatted: mediaData.durationFormatted,
                        url: mediaData.url,
                        isAudio: true
                    });
                    try {
                        await enviarAudio({ client, from, info, filePath: mp3Out, fileName: mediaData.title.slice(0, 30) + ".mp3", preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || '')) });
                        await reply(captionMp3);
                    } finally {
                        try { fs.unlinkSync(mp3Out); } catch (_) {}
                    }
                } else {
                    const cleanTitle = (mediaData.title || "twitter").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }

                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (_) {}
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (_) {}
                return logger.info("[MEDIA HUB] Twitter enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB TWITTER ERROR]", err);
                return reply("❌ *Erro no download do Twitter / X:* " + err.message);
            }
        }

        // 5. INSTAGRAM NATIVO (REELS, POSTS, CARROSSEL E ÁUDIO)
        if (isInstagram) {
            await reply(isMp4 ? "📸 *Baixando Reels/Post do Instagram em alta definição...* Aguarde." : "📸 *Extraindo áudio MP3 do Instagram...* Aguarde.");
            try {
                const instaCmd = require("./insta");
                if (instaCmd && typeof instaCmd.execute === "function") {
                    return await instaCmd.execute({
                        sender,
                        text: (isMp4 ? "mp4 " : "mp3 ") + (cleanUrl || cleanQuery),
                        reply,
                        client,
                        from,
                        info,
                        quotedText
                    });
                }
            } catch (instaErr) {
                logger.error("[MEDIA HUB INSTAGRAM ERROR]", instaErr);
                return reply("❌ *Erro no download do Instagram:* " + instaErr.message);
            }
        }

        // 6. VÍDEO (MP4) GERAL — YOUTUBE, FACEBOOK, REDDIT, VÍDEO WEB
        const isForceAudio = isMp3 || /spotify\.com|soundcloud\.com/i.test(cleanQuery);
        const shouldDownloadVideo = (!isForceAudio) && (isMp4 || looksLikeUrl(cleanQuery));

        if (shouldDownloadVideo) {
            const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");

            let msgVideo = "🎥 *Baixando vídeo MP4 em alta qualidade (4K/HD)...* Aguarde.";
            if (isYouTube) msgVideo = "🎥 *Baixando vídeo do YouTube em alta qualidade (4K/HD)...* Aguarde.";
            else if (isFacebook) msgVideo = "📘 *Baixando vídeo do Facebook em alta definição...* Aguarde.";
            await reply(msgVideo);

            try {
                const meta = await extractMetadata(cleanQuery, { isSearch: !looksLikeUrl(cleanQuery), userJid: sender });
                const targetUrl = meta.webpageUrl || meta.url || cleanQuery;

                const downloaded = await mediaQueue.enqueue({
                    url: targetUrl,
                    format: "mp4",
                    user: sender,
                    duration: meta.duration,
                    runFn: () => downloadMedia({
                        source: targetUrl,
                        url: targetUrl,
                        requestedFormat: "mp4",
                        format: "mp4",
                        duration: meta.duration,
                        metadata: meta,
                        userJid: sender
                    })
                });

                let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0]);
                if (filePath && fs.existsSync(filePath)) {
                    filePath = await ensureMobileVideoCompatibility(filePath);
                    const stats = fs.statSync(filePath);
                    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
                    const cleanTitle = (meta.title || "video").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);

                    const caption = formatMediaCaption({
                        filePath: filePath,
                        elapsedMs: downloaded.elapsedMs,
                        platform: platformName,
                        title: meta.title,
                        author: meta.author,
                        durationFormatted: meta.durationFormatted,
                        url: targetUrl,
                        uploadDate: meta.uploadDate || meta.upload_date,
                        year: meta.year || meta.release_year,
                        isAudio: false
                    });

                    try {
                        // Entrega na galeria sempre que possível; comprime se não couber,
                        // e só vira documento em último caso (ou com a flag -doc).
                        await enviarVideo({
                            client, from, filePath, caption, info,
                            fileName: `${cleanTitle}.mp4`,
                            preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                        })
                        if (client && from && info?.key) {
                            try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (_) {}
                        }
                        logger.info("[MEDIA HUB] Vídeo (" + sizeMb + " MB) enviado para " + sender + ": " + meta.title);
                    } finally {
                        try { fs.unlinkSync(filePath); } catch (_) {}
                    }
                    return;
                }
            } catch (videoErr) {
                logger.error("[MEDIA HUB VIDEO ERROR]", videoErr);
                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (_) {}
                }
                return reply("❌ *Erro no download do vídeo:* " + videoErr.message + "\n\n💡 *Dica:* Se desejar apenas o áudio, tente `.media mp3 " + cleanQuery + "` ou `.play`");
            }
        }

        // 7. ÁUDIO MP3 DE ALTA FIDELIDADE
        let msgAudio = "🎵 *Extraindo áudio MP3 em alta fidelidade...* Aguarde.";
        if (isYouTube) msgAudio = "🎵 *Baixando faixa do YouTube em alta fidelidade...* Aguarde.";
        else if (isSpotify) msgAudio = "🎧 *Baixando faixa do Spotify em alta fidelidade...* Aguarde.";
        await reply(msgAudio);

        try {
            const mediaData = await mediaQueue.enqueue({
                url: cleanQuery,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(cleanQuery)
            });

            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: mediaData.elapsedMs,
                platform: mediaData.platform || platformName,
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                uploadDate: mediaData.uploadDate || mediaData.upload_date,
                year: mediaData.year || mediaData.release_year,
                audioBitrate: "320 kbps",
                isAudio: true
            });

            if (mediaData.thumbnail) {
                try {
                    await client.sendMessage(from, { image: { url: mediaData.thumbnail }, caption }, { quoted: info });
                } catch (_) {}
            }

            if (fs.existsSync(mediaData.filePath)) {
                const cleanTitle = (mediaData.title || "audio").replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
                try {
                    await enviarAudio({
                        client, from, info,
                        filePath: mediaData.filePath,
                        fileName: `${cleanTitle}.mp3`,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                    if (client && from && info?.key) {
                        try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (_) {}
                    }
                } finally {
                    try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                }
            }

            logger.info("[MEDIA HUB] Áudio enviado para " + sender);
        } catch (err) {
            logger.error("[MEDIA HUB ERROR]", err);
            if (client && from && info?.key) {
                try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (_) {}
            }
            await reply("❌ *Falha no processamento da mídia:* " + err.message + "\n\n💡 *Dica:* Verifique se o link é público ou use `.play <nome da música>`.");
        }
    }
};
