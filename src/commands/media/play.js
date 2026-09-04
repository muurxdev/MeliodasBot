/**
 * Comando .play
 * Pesquisa e reproduz músicas (MP3) ou vídeos (MP4) com capa oficial, dados limpos e link de origem
 * Suporta: .play <query> → MP3 | .play mp4 <query> → MP4 (melhor qualidade)
 */

const fs = require('fs')
const path = require('path')
const { rootDir } = require('../../config/paths')
const { searchAndDownloadAudio } = require('../../services/audioStreamService')
const { extractMetadata, downloadMedia } = require('../../services/mediaEngine')
const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor')
const { mediaQueue } = require('../../services/mediaQueue')
const logger = require('../../core/logger')

module.exports = {
    name: 'play',
    aliases: ['musica', 'tocar', 'yt', 'som', 'playmp3', 'audio', 'sp'],
    category: 'media',
    description: 'Pesquisa e baixa músicas (MP3) ou vídeos (MP4) do YouTube e Spotify',
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender }) => {
        if (!text) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║    💡 *COMO USAR O COMANDO* 💡    ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Comando:* \`.play\`\n`
            doc += `📖 *Descrição:* Pesquisa e baixa músicas (MP3) ou vídeos (MP4) em alta qualidade.\n\n`
            doc += `📝 *Exemplos de Uso:*\n`
            doc += `👉 \`.play Rap do Meliodas 7 Minutoz\` — baixa em MP3\n`
            doc += `👉 \`.play mp4 Rap do Meliodas 7 Minutoz\` — baixa em MP4 (melhor qualidade)\n`
            doc += `👉 \`.play https://www.youtube.com/watch?v=...\` — baixa link direto\n\n`
            doc += `💡 *Dica:* Use \`mp4\` antes do nome para baixar como vídeo!`
            return reply(doc.trim())
        }

        // 1. Execução de áudio local
        if (text.startsWith('local ')) {
            const nome = text.replace('local ', '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
            const musica = path.join(rootDir, 'musicas', nome + '.mp3')

            if (!fs.existsSync(musica)) {
                return reply('❌ Arquivo de música local não encontrado no servidor.')
            }

            return client.sendMessage(from, {
                audio: fs.readFileSync(musica),
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: info })
        }

        // Detecta se o usuário quer MP4
        const wantsMp4 = /^(mp4|video|vídeo)\s+/i.test(text)
        let cleanQuery = text.replace(/^(mp3|audio|mp4|video|vídeo)\s+/i, '').replace(/[`$\";&|<>]/g, '').trim()
        if (!cleanQuery) {
            return reply('❌ Termo de pesquisa inválido.')
        }

        const { searchMedia, formatSearchResults } = require('../../services/media/mediaSearch')
        const { setSelection, pickSelection } = require('../../services/media/selectionStore')
        const isUrl = /^https?:\/\//i.test(cleanQuery)
        const isNumber = /^\d{1,2}$/.test(cleanQuery)

        // Fluxo A: número → baixa o item escolhido da última busca
        let downloadInput = cleanQuery
        let downloadAsVideo = false
        if (isNumber) {
            const sel = pickSelection(from, sender, cleanQuery)
            if (!sel) {
                return reply(`❌ Nenhuma busca ativa para selecionar. Faça uma busca primeiro: \`.play <nome da música>\``)
            }
            downloadInput = sel.chosen.url
            downloadAsVideo = !sel.isAudio
            const formatLabel = downloadAsVideo ? '🎬 Vídeo MP4' : '🎵 Áudio MP3'
            await reply(`${formatLabel} *Baixando o ${sel.index}º resultado:* _${sel.chosen.title.slice(0, 60)}_... Aguarde.`)
        }
        // Fluxo B: texto (não URL, não número) → mostra a lista com todos os dados + álbum
        else if (!isUrl) {
            await reply(`🔎 *Buscando:* _${cleanQuery}_... Aguarde.`)
            try {
                const results = await searchMedia(cleanQuery, { limit: 5 })
                if (!results || results.length === 0) {
                    return reply(`❌ Nenhum resultado encontrado para _${cleanQuery}_.`)
                }
                results.forEach((r, i) => { r.index = i + 1 })
                setSelection(from, sender, { query: cleanQuery, results, isAudio: !wantsMp4 })

                const formatIcon = wantsMp4 ? '🎬' : '🎵'
                const formatLabel = wantsMp4 ? 'MP4' : 'MP3'

                // Álbum: capas dos resultados juntas (best-effort)
                const thumbs = results.filter(r => r.thumbnail).slice(0, 5)
                if (thumbs.length > 0) {
                    try {
                        for (let i = 0; i < thumbs.length; i++) {
                            const fmtIcon = wantsMp4 ? '🎬' : '🎵'
                            const fmtLabel = wantsMp4 ? 'MP4' : 'MP3'
                            await client.sendMessage(from, {
                                image: { url: thumbs[i].thumbnail },
                                caption: `*${i + 1}º* — ${thumbs[i].title.slice(0, 55)}\n👤 ${thumbs[i].author} | ⏱️ ${thumbs[i].durationFormatted}\n${fmtIcon} *Formato:* ${fmtLabel}`
                            }, { quoted: i === 0 ? info : undefined })
                        }
                    } catch (_) {}
                }
                return reply(formatSearchResults(cleanQuery, results, { cmd: 'play', isAudio: !wantsMp4 }))
            } catch (e) {
                logger.error('[PLAY SEARCH ERROR]', e)
                return reply(`❌ *Falha na busca:* ${e.message}`)
            }
        }
        // Fluxo C: URL → baixa direto (downloadInput já é a URL)
        else {
            downloadAsVideo = wantsMp4
            const formatLabel = downloadAsVideo ? '🎬 Vídeo MP4' : '🎵 Áudio MP3'
            await reply(`${formatLabel} *Baixando do link...* Aguarde.`)
        }

        try {
            if (downloadAsVideo) {
                // === DOWNLOAD VÍDEO MP4 ===
                const targetUrl = downloadInput
                const isDirectUrl = /^https?:\/\//i.test(targetUrl)

                // Extrai metadados (rápido, sem download)
                let meta = { title: 'Vídeo', author: 'Desconhecido', durationFormatted: '—', thumbnail: null, platform: 'YouTube' }
                try {
                    meta = await extractMetadata(targetUrl, { isSearch: !isDirectUrl, userJid: sender })
                } catch (_) {}

                const downloaded = await mediaQueue.enqueue({
                    url: targetUrl,
                    format: 'mp4',
                    user: sender,
                    runFn: () => downloadMedia({
                        source: targetUrl,
                        url: targetUrl,
                        requestedFormat: 'mp4',
                        format: 'mp4',
                        userJid: sender
                    })
                })

                let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
                if (!filePath || !fs.existsSync(filePath)) {
                    throw new Error('Arquivo de vídeo não encontrado após o download.')
                }

                filePath = await ensureMobileVideoCompatibility(filePath)
                const stats = fs.statSync(filePath)
                const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)
                const cleanTitle = (meta.title || 'video').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)

                const { formatMediaCaption } = require('../../services/media/formatResolver')
                const caption = formatMediaCaption({
                    filePath,
                    elapsedMs: downloaded.elapsedMs,
                    platform: meta.platform || 'YouTube',
                    title: meta.title,
                    author: meta.author,
                    durationFormatted: meta.durationFormatted,
                    url: targetUrl,
                    isAudio: false
                })

                if (meta.thumbnail) {
                    try {
                        await client.sendMessage(from, {
                            image: { url: meta.thumbnail },
                            caption
                        }, { quoted: info })
                    } catch (_) {}
                }

                const videoBuf = fs.readFileSync(filePath)
                if (stats.size <= 100 * 1024 * 1024) {
                    await client.sendMessage(from, {
                        video: videoBuf,
                        caption,
                        mimetype: 'video/mp4'
                    }, { quoted: info })
                } else {
                    await client.sendMessage(from, {
                        document: videoBuf,
                        mimetype: 'video/mp4',
                        fileName: `${cleanTitle}.mp4`,
                        caption: `${caption}\n\n📦 *Enviado como documento (${sizeMb} MB) para preservar a qualidade original do arquivo.*`
                    }, { quoted: info })
                }

                try { fs.unlinkSync(filePath) } catch (_) {}
                logger.info(`[PLAY] Vídeo (${sizeMb} MB) enviado para ${sender}: ${meta.title}`)
            } else {
                // === DOWNLOAD ÁUDIO MP3 ===
                const mediaData = await mediaQueue.enqueue({
                    url: downloadInput,
                    format: 'mp3',
                    user: sender,
                    runFn: async () => {
                        return searchAndDownloadAudio(downloadInput)
                    }
                })

                const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 35)

                const { formatMediaCaption } = require('../../services/media/formatResolver')
                const audioCaption = formatMediaCaption({
                    filePath: mediaData.filePath,
                    elapsedMs: mediaData.elapsedMs,
                    platform: mediaData.platform || 'YouTube',
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    isAudio: true
                })

                if (mediaData.thumbnail) {
                    try {
                        await client.sendMessage(from, {
                            image: { url: mediaData.thumbnail },
                            caption: audioCaption
                        }, { quoted: info })
                    } catch (_) {}
                }

                if (fs.existsSync(mediaData.filePath)) {
                    const audioBuffer = fs.readFileSync(mediaData.filePath)
                    await client.sendMessage(from, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        fileName: `${cleanFileName}.mp3`
                    }, { quoted: info })
                    try { fs.unlinkSync(mediaData.filePath) } catch (_) {}
                }

                logger.info(`[PLAY] Áudio enviado para ${sender}: ${mediaData.title}`)
            }
        } catch (err) {
            logger.error('[PLAY ERROR]', err)
            const msg = err.message || 'Erro desconhecido'
            if (msg.includes('⚠️') || msg.includes('❌')) {
                await reply(msg)
            } else {
                const formatLabel = downloadAsVideo ? 'vídeo' : 'áudio'
                await reply(`❌ *Falha ao baixar ${formatLabel}:* ${msg}`)
            }
        }
    }
}
