/**
 * Comando .playlist — baixa uma playlist inteira para o Google Drive.
 *
 * Entrega UM link de pasta em vez de N mensagens de vídeo: 50 arquivos soltos
 * no WhatsApp estouram o rate limit e ainda chegariam recomprimidos.
 *
 * `.playlist <url>`          -> qualidade máxima (4K/8K quando existir)
 * `.playlist <url> 1080`     -> teto de 1080p (mais rápido, ocupa menos Drive)
 * `.playlist <url> -listar`  -> só mostra o que seria baixado, sem baixar
 */

const drive = require('../../services/drive/googleDriveService')
const { listarPlaylist, baixarPlaylistParaDrive, MAX_ITENS } = require('../../services/drive/playlistService')
const logger = require('../../core/logger')

const QUALIDADES = { 360: '360p', 480: '480p', 720: '720p', 1080: '1080p', max: 'max' }

function formatarDuracao(seg) {
    if (!seg) return '—'
    const h = Math.floor(seg / 3600)
    const m = Math.floor((seg % 3600) / 60)
    const s = Math.floor(seg % 60)
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`
}

module.exports = {
    name: 'playlist',
    aliases: ['plist', 'baixarplaylist'],
    category: 'media',
    subcategory: 'Downloads',
    description: 'Baixa uma playlist inteira em qualidade máxima e entrega o link da pasta no Drive',
    cooldownMs: 15000,
    execute: async ({ sender, text, reply, client, from, info }) => {
        if (!text || !text.trim()) {
            return reply(
                '❌ Envie o link da playlist.\n\n' +
                '📌 *Exemplos:*\n' +
                '`.playlist https://youtube.com/playlist?list=...`\n' +
                '`.playlist <link> 1080` — limita a 1080p\n' +
                '`.playlist <link> -listar` — só mostra o conteúdo\n\n' +
                `_Máximo de ${MAX_ITENS} vídeos por playlist._`
            )
        }

        if (!drive.isConfigured()) {
            return reply(
                '❌ *Google Drive não configurado.*\n\n' +
                'Uma playlist inteira não cabe no WhatsApp, então ela precisa ir para o Drive.\n' +
                '_Peça ao dono do bot para rodar_ `node scripts/google-drive-auth.js`_._'
            )
        }

        const partes = text.trim().split(/\s+/)
        const url = partes[0]
        const soListar = /(^|\s)-?listar(\s|$)/i.test(text)

        const argQualidade = partes.slice(1).find(p => QUALIDADES[p.replace(/p$/i, '')])
        const quality = argQualidade ? QUALIDADES[argQualidade.replace(/p$/i, '')] : 'max'

        if (!/^https?:\/\//i.test(url)) {
            return reply('❌ O primeiro argumento precisa ser o *link* da playlist.')
        }

        try {
            await reply('🔎 *Lendo a playlist...*')
            const pl = await listarPlaylist(url, sender)

            if (soListar) {
                const linhas = pl.itens.slice(0, 30).map((it, i) =>
                    `${String(i + 1).padStart(2, '0')}. ${it.title.slice(0, 55)} _(${formatarDuracao(it.duration)})_`
                ).join('\n')
                return reply(
                    `📃 *${pl.titulo}*\n` +
                    `${pl.itens.length} vídeo(s)${pl.truncada ? ` _(de ${pl.total} — limitado a ${MAX_ITENS})_` : ''}\n\n` +
                    linhas +
                    (pl.itens.length > 30 ? `\n\n_...e mais ${pl.itens.length - 30}._` : '') +
                    '\n\n💡 _Para baixar, repita o comando sem_ `-listar`_._'
                )
            }

            // Uma playlist longa em 4K pode levar horas. Avisar antes evita que o
            // usuário repita o comando achando que travou.
            const status = await client.sendMessage(from, {
                text: `☁️ *${pl.titulo}*\n` +
                      `${pl.itens.length} vídeo(s) • qualidade: ${quality === 'max' ? 'MÁXIMA (4K se existir)' : quality}\n\n` +
                      `⏳ Isso leva um tempo. Vou te avisar aqui quando terminar.`
            }, { quoted: info })

            let ultimoTexto = ''
            const onEvento = (evt) => {
                if (evt.fase !== 'baixando' && evt.fase !== 'enviando') return
                const icone = evt.fase === 'baixando' ? '⬇️' : '☁️'
                const sufixo = evt.pct != null ? ` ${evt.pct}%` : ''
                const txt = `☁️ *${pl.titulo}*\n\n` +
                            `${icone} ${evt.indice}/${evt.total}${sufixo}\n` +
                            `_${String(evt.titulo || '').slice(0, 50)}_`
                // Só edita quando o texto muda: evita flood de edições idênticas.
                if (txt === ultimoTexto) return
                ultimoTexto = txt
                client.sendMessage(from, { edit: status.key, text: txt })
                    .catch(e => logger.warn(`[PLAYLIST CMD] Não editei o status: ${e.message}`))
            }

            const r = await baixarPlaylistParaDrive({ url, quality, userJid: sender, onEvento })

            let msg = `✅ *${r.titulo}*\n\n`
            msg += `📁 *Pasta no Drive:*\n${r.pastaUrl}\n\n`
            msg += `🎬 ${r.enviados.length} vídeo(s) enviados`
            if (r.truncada) msg += `\n_(playlist tem ${r.totalOriginal}; baixei os primeiros ${MAX_ITENS})_`
            if (r.falhas.length) {
                msg += `\n\n⚠️ *${r.falhas.length} falharam:*\n`
                msg += r.falhas.slice(0, 5).map(f => `• ${f.titulo.slice(0, 40)} — _${f.erro.slice(0, 60)}_`).join('\n')
            }
            msg += '\n\n💡 _Abra a pasta para assistir online ou baixar cada vídeo em qualidade original._'

            await client.sendMessage(from, { edit: status.key, text: msg })
                .catch(() => reply(msg))
        } catch (e) {
            logger.error(`[PLAYLIST CMD] Falhou para "${url}": ${e.message}`)
            return reply(`❌ *Não consegui baixar a playlist.*\n\n_${e.message}_`)
        }
    }
}
