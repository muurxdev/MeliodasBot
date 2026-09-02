/**
 * MeliodasBot — Comando .play
 * Pesquisa e reproduz músicas com capa oficial, dados limpos e link de origem
 */

const fs = require('fs')
const path = require('path')
const { rootDir } = require('../../config/paths')
const { searchAndDownloadAudio } = require('../../services/audioStreamService')
const { mediaQueue } = require('../../services/mediaQueue')
const logger = require('../../core/logger')

module.exports = {
    name: 'play',
    aliases: ['musica', 'tocar', 'yt', 'som', 'playmp3', 'audio', 'spotify', 'sp'],
    category: 'media',
    description: 'Pesquisa e reproduz músicas do YouTube e Spotify com capa oficial e link de origem',
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender }) => {
        if (!text) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║    💡 *COMO USAR O COMANDO* 💡    ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Comando:* \`.play\`\n`
            doc += `📖 *Descrição:* Pesquisa e baixa faixas em áudio MP3 de alta qualidade.\n\n`
            doc += `📝 *Exemplos de Uso:*\n`
            doc += `👉 \`.play Rap do Meliodas 7 Minutoz\`\n`
            doc += `👉 \`.play Mc Iguinho GRWM\`\n`
            doc += `👉 \`.play https://www.youtube.com/watch?v=...\`\n\n`
            doc += `💡 *Dica:* Digite o nome da música, cantor ou cole o link do YouTube diretamente!`
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

        let cleanQuery = text.replace(/^(mp3|audio)\s+/i, '').replace(/[`$\";&|<>]/g, '').trim()
        if (!cleanQuery) {
            return reply('❌ Termo de pesquisa inválido.')
        }

        const { searchMedia, formatSearchResults } = require('../../services/media/mediaSearch')
        const { setSelection, pickSelection } = require('../../services/media/selectionStore')
        const isUrl = /^https?:\/\//i.test(cleanQuery)
        const isNumber = /^\d{1,2}$/.test(cleanQuery)

        // Fluxo A: número → baixa o item escolhido da última busca
        let downloadInput = cleanQuery
        if (isNumber) {
            const sel = pickSelection(from, sender, cleanQuery)
            if (!sel) {
                return reply(`❌ Nenhuma busca ativa para selecionar. Faça uma busca primeiro: \`.play <nome da música>\``)
            }
            downloadInput = sel.chosen.url
            await reply(`🎵 *Baixando o ${sel.index}º resultado:* _${sel.chosen.title.slice(0, 60)}_... Aguarde.`)
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
                setSelection(from, sender, { query: cleanQuery, results, isAudio: true })

                // Álbum: capas dos resultados juntas (best-effort)
                const thumbs = results.filter(r => r.thumbnail).slice(0, 5)
                if (thumbs.length > 0) {
                    try {
                        for (let i = 0; i < thumbs.length; i++) {
                            await client.sendMessage(from, {
                                image: { url: thumbs[i].thumbnail },
                                caption: `*${i + 1}º* — ${thumbs[i].title.slice(0, 55)}\n👤 ${thumbs[i].author} | ⏱️ ${thumbs[i].durationFormatted}`
                            }, { quoted: i === 0 ? info : undefined })
                        }
                    } catch (_) {}
                }
                return reply(formatSearchResults(cleanQuery, results, { cmd: 'play', isAudio: true }))
            } catch (e) {
                logger.error('[PLAY SEARCH ERROR]', e)
                return reply(`❌ *Falha na busca:* ${e.message}`)
            }
        }
        // Fluxo C: URL → baixa direto (downloadInput já é a URL)
        else {
            await reply(`🎵 *Baixando faixa do link...* Aguarde.`)
        }

        try {
            // 2. Download e conversão via fila prioritária
            const mediaData = await mediaQueue.enqueue({
                url: downloadInput,
                format: 'mp3',
                user: sender,
                runFn: async () => {
                    return searchAndDownloadAudio(downloadInput)
                }
            })

            const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 35)

            // 3. Envia capa oficial com informações elegantes e link da música
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

            // 4. Envia o arquivo de áudio MP3 (320 kbps Master)
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
        } catch (err) {
            logger.error('[PLAY ERROR]', err)
            await reply(`❌ *Falha ao reproduzir áudio:* ${err.message}`)
        }
    }
}