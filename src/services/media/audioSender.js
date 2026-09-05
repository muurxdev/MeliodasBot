/**
 * Envio inteligente de áudio no WhatsApp.
 *
 * O CASO QUE QUEBRAVA
 * -------------------
 * Os comandos mandavam `audio: { url }` sem olhar o tamanho. Funciona para uma
 * música de 4 min (~4 MB). Uma live de pagode de 3 horas vira ~165 MB de MP3:
 * o WhatsApp recusa (limite ~16 MB para áudio tocável) e o usuário recebe erro
 * ou um arquivo mudo, sem explicação.
 *
 * Comprimir não salva: 3 h em 32 kbps ainda dá ~41 MB, e o som fica horrível.
 * Áudio longo simplesmente não cabe como mídia do WhatsApp.
 *
 * A ORDEM AQUI
 * ------------
 *   1. Cabe (≤16 MB)  -> manda como áudio tocável. Caminho ideal.
 *   2. Drive ligado    -> sobe o original inteiro e manda UM link. Melhor opção
 *                         para conteúdo longo: um toque e toca no app do Drive.
 *   3. Sem Drive       -> divide em partes tocáveis de ~15 min. Vira várias
 *                         mensagens, mas todas tocam direto no WhatsApp.
 *   4. Último caso     -> documento.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const drive = require('../drive/googleDriveService')

// Limite prático do áudio tocável no WhatsApp.
const LIMITE_AUDIO = Number(process.env.WHATSAPP_AUDIO_MAX_BYTES || 16 * 1024 * 1024)

// Duração de cada parte quando é preciso dividir. 15 min em 128 kbps ≈ 14 MB,
// logo abaixo do limite, com folga para a variação do VBR.
const SEGUNDOS_POR_PARTE = Number(process.env.AUDIO_SPLIT_SECONDS || 15 * 60)

// Acima disso, dividir viraria dezenas de mensagens e floodaria o grupo.
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
 * Envia o áudio do melhor jeito possível.
 *
 * @param {object} o
 * @param {boolean} [o.preferirPartes] força a divisão mesmo com o Drive ligado
 * @returns {Promise<{modo:string}>}
 */
async function enviarAudio({ client, from, filePath, caption = '', info, fileName, preferirPartes = false }) {
    const tamanho = fs.statSync(filePath).size
    const nome = fileName || path.basename(filePath)
    const tituloLimpo = nome.replace(/\.[^.]+$/, '')

    // 1. Cabe: caminho ideal, toca direto na conversa.
    if (tamanho <= LIMITE_AUDIO) {
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

    logger.info(`[AUDIO SENDER] "${nome}" tem ${mb(tamanho)} MB — acima do limite de ${mb(LIMITE_AUDIO)} MB`)

    // 2. Drive: um link, arquivo inteiro, qualidade original.
    if (drive.isConfigured() && !preferirPartes) {
        try {
            const r = await enviarParaDrive({ client, from, filePath, fileName: nome, tamanho })
            await client.sendMessage(from, {
                text: (caption ? caption + '\n\n' : '') +
                    `🎧 *${tituloLimpo}*\n` +
                    `_${mb(tamanho)} MB — longo demais para tocar aqui no WhatsApp._\n\n` +
                    `▶️ Ouvir: ${r.visualizar}\n` +
                    `⬇️ Baixar: ${r.baixar}\n\n` +
                    `💡 _Quer em pedaços que tocam direto na conversa? Use_ \`-partes\`_._`
            }, { quoted: info })
            return { modo: 'drive', drive: r }
        } catch (e) {
            logger.warn(`[AUDIO SENDER] Drive falhou, vou dividir: ${e.message}`)
        }
    }

    // 3. Divide em partes tocáveis.
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

    // 4. Não deu para dividir: manda o arquivo.
    await client.sendMessage(from, {
        document: { url: filePath },
        mimetype: 'audio/mpeg',
        fileName: nome,
        caption: (caption ? caption + '\n\n' : '') +
            `📦 *Enviado como arquivo (${mb(tamanho)} MB)* — longo demais para tocar na conversa.`
    }, { quoted: info, mediaUploadTimeoutMs: 600000 })
    return { modo: 'documento' }
}

module.exports = { enviarAudio, dividirEmPartes, duracaoSegundos, LIMITE_AUDIO, SEGUNDOS_POR_PARTE }
