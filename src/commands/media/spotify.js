/**
 * Comando .spotify / .sp
 * Download direto de faixas, álbuns e playlists do Spotify em MP3 de alta fidelidade
 */

const fs = require("fs");
const { searchAndDownloadAudio, resolvePlaylistTracks } = require("../../services/audioStreamService");
const { mediaQueue } = require("../../services/mediaQueue");
const { formatMediaCaption } = require("../../services/media/formatResolver");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "spotify",
    aliases: ["sp", "spot", "spotifydl", "spotifyplaylist", "spotifyalbum"],
    category: "media",
    description: "Baixa músicas, álbuns e playlists completas do Spotify em MP3 com capa oficial",
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender }) => {
        const botName = getBotName();
        const rawInput = (text || "").trim();

        if (!rawInput) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║    🟢 *SPOTIFY MUSIC HUB* 🟢    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• `.spotify <nome da música>` — Buscar e baixar música do Spotify\n";
            doc += "• `.spotify <link da faixa>` — Baixar música direta pelo link\n";
            doc += "• `.spotify <link de playlist/álbum>` — Baixar álbum ou playlist completa\n\n";
            doc += "📝 *Exemplos:*\n";
            doc += "👉 `.spotify Blinding Lights The Weeknd`\n";
            doc += "👉 `.spotify https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b`\n";
            doc += "👉 `.spotify https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        const urlMatch = rawInput.match(/https?:\/\/[^\s"'<>]+/i);
        const cleanUrl = urlMatch ? urlMatch[0].trim() : "";

        // 1. SUPORTE A PLAYLISTS OU ÁLBUNS COMPLETOS
        if (cleanUrl && /open\.spotify\.com\/(playlist|album)/i.test(cleanUrl)) {
            const playlistInfo = await resolvePlaylistTracks(cleanUrl);
            if (playlistInfo && playlistInfo.isPlaylist && playlistInfo.tracks.length > 0) {
                const totalTracks = playlistInfo.tracks.length;
                let playlistDoc = "╔══════════════════════════════╗\n";
                playlistDoc += "║  🟢 *SPOTIFY " + playlistInfo.type.toUpperCase() + "* 🟢 ║\n";
                playlistDoc += "╚══════════════════════════════╝\n\n";
                playlistDoc += "╭━〔 📋 DETALHES DO ACERVO 〕━⬣\n";
                playlistDoc += "┃ 📂 *Título:* " + playlistInfo.title + "\n";
                playlistDoc += "┃ 📦 *Total de Músicas:* *" + totalTracks + " faixas*\n";
                playlistDoc += "┃ 🎧 *Qualidade:* MP3 (alta fidelidade)\n";
                playlistDoc += "┃ ⏳ *Status:* Enviando músicas em lote sequencial...\n";
                playlistDoc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
                playlistDoc += "👑 *" + botName + "*";

                await reply(playlistDoc.trim());

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
                elapsedMs: mediaData.elapsedMs,
                            platform: "Spotify",
                            title: `[${i + 1}/${limit}] ${mediaData.title}`,
                            author: mediaData.author,
                            durationFormatted: mediaData.durationFormatted,
                            url: track.url || mediaData.url,
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
                    } catch (tErr) {
                        logger.warn(`[SPOTIFY TRACK WARN] Faixa ${i + 1}: ${tErr.message}`);
                    }
                }
                return logger.info(`[SPOTIFY] Playlist/Álbum enviado com sucesso para ${sender}`);
            }
        }

        // 2. FAIXA SOLO DO SPOTIFY (POR LINK OU BUSCA)
        await reply(`🟢 *Processando faixa no Spotify:* _${rawInput.slice(0, 40)}_... Aguarde.`);

        try {
            const mediaData = await mediaQueue.enqueue({
                url: rawInput,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(rawInput)
            });

            const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, "").slice(0, 35);
            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: mediaData.elapsedMs,
                platform: "Spotify",
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
                await client.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${cleanFileName}.mp3`
                }, { quoted: info });
                try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
            }

            logger.info(`[SPOTIFY] Música enviada para ${sender}: ${mediaData.title}`);
        } catch (err) {
            logger.error("[SPOTIFY ERROR]", err);
            return reply(`❌ *Erro ao baixar do Spotify:* ${err.message}`);
        }
    }
};

