/**
 * Envio inteligente de áudio no WhatsApp.
 *
 * DIRETRIZES:
 * 1. Até 100 MB  -> Manda direto como áudio completo e original na conversa (sem compressão/perda).
 * 2. > 100 MB    -> Manda como arquivo/documento na íntegra (ou partes se solicitado com -partes).
 * 3. > 2 GB      -> Sobe para o Google Drive 5TB com links de streaming e pasta.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const drive = require('../drive/googleDriveService')

// Limite prático do áudio tocável no WhatsApp (até 100 MB toca direto)
const LIMITE_AUDIO = Number(process.env.WHATSAPP_AUDIO_MAX_BYTES || 100 * 1024 * 1024)

// Limite de envio via documento/arquivo (até 2 GB)
const LIMITE_DOCUMENTO = Number(process.env.WHATSAPP_DOC_MAX_BYTES || 2000 * 1024 * 1024)

// Duração de cada parte quando o usuário pede divisão com -partes
const SEGUNDOS_POR_PARTE = Number(process.env.AUDIO_SPLIT_SECONDS || 15 * 60)

// Acima disso, dividir viraria dezenas de mensagens e floodaria o grupo
const MAX_PARTES = Number(process.env.AUDIO_MAX_PARTES || 12)

const mb = b => (b / 1024 / 1024).toFixed(1)

function _ffmpeg(args, timeoutMs = 900000) {
    return new Promise(resolve => {
        const p = spawn('ffmpeg', args)
        let erro = ''
        const t = setTimeout(() => {
            try { p.kill('SIGKILL') } catch (e) { /* já morreu */ }
            resolve({ ok: false, erro: 'tempo limite do ffmpeg' })
        }, timeoutMs)
        p.stderr.on('data', d => { erro = String(d).slice(-400) })
        p.on('error', e => { clearTimeout(t); resolve({ ok: false, erro: e.message }) })
        p.on('close', code => { clearTimeout(t); resolve({ ok: code === 0, erro }) })
    })
}

/** Duração em segundos via ffprobe. Devolve 0 se não der para medir. */
function duracaoSegundos(filePath) {
    return new Promise(resolve => {
        const p = spawn('ffprobe', ['-v', 'quiet', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', filePath])
        let out = ''
        p.stdout.on('data', d => { out += d })
        p.on('error', () => resolve(0))
        p.on('close', () => resolve(Math.floor(Number(out.trim()) || 0)))
    })
}

/**
 * Divide o áudio em partes tocáveis, sem recodificar (`-c copy`): é quase
 * instantâneo e não perde qualidade.
 * @returns {Promise<string[]>} caminhos das partes, em ordem
 */
async function dividirEmPartes(origem, segundosPorParte = SEGUNDOS_POR_PARTE) {
    const dur = await duracaoSegundos(origem)
    if (!dur) return []

    const total = Math.ceil(dur / segundosPorParte)
    if (total > MAX_PARTES) {
        logger.warn(`[AUDIO SENDER] ${total} partes excede o máximo de ${MAX_PARTES} — não vou dividir`)
        return []
    }

    const dir = path.join(tempDir, `audio_partes_${Date.now()}`)
    fs.mkdirSync(dir, { recursive: true })

    const { ok, erro } = await _ffmpeg([
        '-y', '-i', origem,
        '-f', 'segment',
        '-segment_time', String(segundosPorParte),
        '-c', 'copy',
        '-reset_timestamps', '1',
        path.join(dir, 'parte_%03d.mp3')
    ])
    if (!ok) {
        logger.warn(`[AUDIO SENDER] Falha ao dividir: ${erro}`)
        try { fs.rmSync(dir, { recursive: true, force: true }) } catch (e) { /* já foi */ }
        return []
    }

    return fs.readdirSync(dir).sort().map(f => path.join(dir, f))
}

/** Sobe o original para o Drive mostrando progresso numa mensagem editada. */
async function enviarParaDrive({ client, from, filePath, fileName, tamanho }) {
    const quota = await drive.getQuota()
    if (quota.livre < tamanho * 1.05) {
        throw new Error(`Sem espaço no Drive: faltam ${mb(tamanho - quota.livre)} MB`)
    }

    const status = await client.sendMessage(from, {
        text: `☁️ *Enviando o áudio completo para o Drive...*\n${mb(tamanho)} MB — 0%`
    })

    let ultimoMarco = 0
    const onProgress = pct => {
        if (pct < ultimoMarco + 10 && pct < 100) return
        ultimoMarco = pct
        const barra = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10))
        client.sendMessage(from, {
            edit: status.key,
            text: `☁️ *Enviando o áudio completo...*\n${mb(tamanho)} MB\n\n${barra} ${pct}%`
        }).catch(e => logger.warn(`[AUDIO SENDER] Não editei o status: ${e.message}`))
    }

    const r = await drive.enviarECompartilhar({
        filePath, fileName, mimeType: 'audio/mpeg', onProgress
    })

    await client.sendMessage(from, {
        edit: status.key, text: `☁️ *Áudio no Drive* — ${mb(tamanho)} MB ✅`
    }).catch(e => logger.warn(`[AUDIO SENDER] Não editei o status final: ${e.message}`))

    return r
}

/**
 * Envia o áudio completo em qualidade máxima.
 *
 * @param {object} o
 * @param {boolean} [o.preferirPartes] força a divisão se pedido explicitamente
 * @returns {Promise<{modo:string}>}
 */
async function enviarAudio({ client, from, filePath, caption = '', info, fileName, preferirPartes = false }) {
    const tamanho = fs.statSync(filePath).size
    const nome = fileName || path.basename(filePath)
    const tituloLimpo = nome.replace(/\.[^.]+$/, '')

    // 0. Arquivos maiores que 2GB (Teto máximo do WhatsApp) -> Google Drive 5TB
    if (tamanho > LIMITE_DOCUMENTO) {
        if (drive.isConfigured()) {
            try {
                const r = await enviarParaDrive({ client, from, filePath, fileName: nome, tamanho })
                let docMsg = `╔══════════════════════════════╗\n`
                docMsg += `║   ☁️ *ÁUDIO SALVO NO DRIVE (5TB)*   ║\n`
                docMsg += `╚══════════════════════════════╝\n\n`
                if (caption) docMsg += `${caption}\n\n`
                docMsg += `🎧 *Título:* \`${tituloLimpo}\`\n`
                docMsg += `📊 *Tamanho:* *${mb(tamanho)} MB*\n\n`
                docMsg += `⚠️ *Aviso:* Este áudio ultrapassa o limite de 2GB do WhatsApp. Por isso foi salvo integralmente no seu Drive de 5TB.\n\n`
                docMsg += `╭━〔 🔗 *LINKS DE ACESSO* 〕━⬣\n`
                if (r.folderUrl) docMsg += `┃ 📁 *Pasta no Drive:* ${r.folderUrl}\n`
                docMsg += `┃ ▶️ *Ouvir Online:* ${r.visualizar}\n`
                docMsg += `┃ ⬇️ *Download Direto:* ${r.baixar}\n`
                docMsg += `╰━━━━━━━━━━━━━━━━━━━━⬣\n`
                await client.sendMessage(from, { text: docMsg.trim() }, { quoted: info })
                return { modo: 'drive', drive: r }
            } catch (err) {
                logger.error(`[AUDIO SENDER] Falha ao enviar para o Drive (>2GB): ${err.message}`)
            }
        }
    }

    // 1. Até 100MB: manda DIRETO como áudio completo e original na conversa!
    if (tamanho <= LIMITE_AUDIO && !preferirPartes) {
        await client.sendMessage(from, {
            audio: { url: filePath },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: nome
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        if (caption) {
            await client.sendMessage(from, { text: caption }, { quoted: info })
        }
        return { modo: 'audio' }
    }

    logger.info(`[AUDIO SENDER] "${nome}" tem ${mb(tamanho)} MB — acima de ${mb(LIMITE_AUDIO)} MB`)

    // 2. Se o usuário explicitamente pediu para dividir em partes
    if (preferirPartes) {
        const partes = await dividirEmPartes(filePath)
        if (partes.length) {
            await client.sendMessage(from, {
                text: (caption ? caption + '\n\n' : '') +
                    `🎧 *${tituloLimpo}*\n` +
                    `_${mb(tamanho)} MB não cabe numa mensagem só._\n` +
                    `Vou mandar em *${partes.length} partes* de ~${Math.round(SEGUNDOS_POR_PARTE / 60)} min. ` +
                    `Todas tocam direto aqui. 👇`
            }, { quoted: info })

            let enviadas = 0
            for (const [i, parte] of partes.entries()) {
                try {
                    await client.sendMessage(from, {
                        audio: { url: parte },
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        fileName: `${tituloLimpo} (${i + 1} de ${partes.length}).mp3`
                    }, { mediaUploadTimeoutMs: 300000 })
                    enviadas++
                } catch (e) {
                    logger.warn(`[AUDIO SENDER] Parte ${i + 1}/${partes.length} falhou: ${e.message}`)
                }
            }

            try { fs.rmSync(path.dirname(partes[0]), { recursive: true, force: true }) } catch (e) {
                logger.warn(`[AUDIO SENDER] Não limpei as partes: ${e.message}`)
            }
            return { modo: 'partes', partes: enviadas }
        }
    }

    // 3. Maior que 100MB e até 2GB: manda como DOCUMENTO / ARQUIVO completo
    await client.sendMessage(from, {
        document: { url: filePath },
        mimetype: 'audio/mpeg',
        fileName: nome,
        caption: (caption ? caption + '\n\n' : '') +
            `📦 *Enviado como arquivo (${mb(tamanho)} MB)* — arquivo maior que 100 MB enviado na íntegra em qualidade original.`
    }, { quoted: info, mediaUploadTimeoutMs: 600000 })
    return { modo: 'documento' }
}

module.exports = { enviarAudio, dividirEmPartes, duracaoSegundos, LIMITE_AUDIO, LIMITE_DOCUMENTO, SEGUNDOS_POR_PARTE }
