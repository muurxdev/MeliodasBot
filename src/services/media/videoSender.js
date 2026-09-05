/**
 * Envio inteligente de vídeo no WhatsApp.
 *
 * O problema: o WhatsApp tem DOIS caminhos e eles são excludentes.
 *   - Como MÍDIA (video)    -> aparece na galeria, toca sozinho... mas o limite
 *                              real é ~16 MB no app (64 MB no Web).
 *   - Como DOCUMENTO        -> aceita até 2 GB e preserva a qualidade original,
 *                              mas NÃO entra na galeria: para quem não é técnico,
 *                              é um arquivo que "não abre".
 *
 * O código antigo mandava como vídeo tudo até 100 MB — muito acima do que o
 * WhatsApp aceita — então arquivos de 20-100 MB falhavam ou chegavam destruídos.
 *
 * Estratégia daqui: entregar na GALERIA sempre que der. Se o arquivo original
 * não couber, recomprime com ffmpeg até caber (mantendo H.264/AAC) e avisa o que
 * foi feito. Só cai para documento se nem isso resolver, ou se o usuário pedir
 * a qualidade máxima explicitamente.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')

// Limite seguro para chegar na galeria de qualquer aparelho.
const LIMITE_GALERIA = Number(process.env.WHATSAPP_MEDIA_MAX_BYTES || 16 * 1024 * 1024)

const mb = b => (b / 1024 / 1024).toFixed(1)

function _ffmpeg(args, timeoutMs = 600000) {
    return new Promise(resolve => {
        const p = spawn('ffmpeg', args)
        const t = setTimeout(() => { try { p.kill() } catch (_) {} resolve(false) }, timeoutMs)
        p.on('error', () => { clearTimeout(t); resolve(false) })
        p.on('close', code => { clearTimeout(t); resolve(code === 0) })
    })
}

/**
 * Recomprime até caber no limite da galeria.
 * Vai reduzindo resolução/qualidade em degraus até passar.
 * @returns {Promise<string|null>} caminho do arquivo comprimido, ou null
 */
async function comprimirParaGaleria(origem, limiteBytes = LIMITE_GALERIA) {
    const degraus = [
        { altura: 720, crf: 28 },
        { altura: 480, crf: 30 },
        { altura: 360, crf: 32 }
    ]
    for (const [i, d] of degraus.entries()) {
        const saida = path.join(tempDir, `galeria_${Date.now()}_${i}.mp4`)
        const ok = await _ffmpeg([
            '-y', '-i', origem,
            '-vf', `scale=-2:'min(${d.altura},ih)'`,
            '-c:v', 'libx264', '-crf', String(d.crf), '-preset', 'veryfast',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart',
            saida
        ])
        if (!ok || !fs.existsSync(saida)) continue
        const tam = fs.statSync(saida).size
        if (tam <= limiteBytes) {
            logger.info(`[VIDEO SENDER] Comprimido para ${d.altura}p (${mb(tam)} MB) — cabe na galeria`)
            return saida
        }
        try { fs.unlinkSync(saida) } catch (_) {}
    }
    return null
}

/**
 * Envia o vídeo do melhor jeito possível.
 * @param {object} o
 * @param {boolean} [o.preferirDocumento] usuário pediu qualidade máxima (flag -doc)
 * @returns {Promise<{modo:'video'|'video-comprimido'|'documento'}>}
 */
async function enviarVideo({ client, from, filePath, caption, info, fileName, preferirDocumento = false }) {
    const tamanho = fs.statSync(filePath).size
    const nome = fileName || path.basename(filePath)

    const comoDocumento = async (nota) => {
        await client.sendMessage(from, {
            document: { url: filePath },
            mimetype: 'video/mp4',
            fileName: nome,
            caption: caption + (nota ? `\n\n${nota}` : '')
        }, { quoted: info, mediaUploadTimeoutMs: 600000 })
        return { modo: 'documento' }
    }

    // 1. Já cabe: caminho ideal, vai direto para a galeria.
    if (tamanho <= LIMITE_GALERIA && !preferirDocumento) {
        await client.sendMessage(from, {
            video: { url: filePath }, caption, mimetype: 'video/mp4'
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        return { modo: 'video' }
    }

    // 2. Usuário quer a qualidade original acima de tudo.
    if (preferirDocumento) {
        return comoDocumento(`📦 *Enviado como arquivo (${mb(tamanho)} MB)* para preservar a qualidade original.\n⚠️ _Arquivo não aparece na galeria._`)
    }

    // 3. Grande demais: comprime para caber e chegar na galeria.
    let comprimido = null
    try {
        comprimido = await comprimirParaGaleria(filePath)
    } catch (e) {
        logger.warn(`[VIDEO SENDER] Falha ao comprimir: ${e.message}`)
    }

    if (comprimido) {
        try {
            const novoTam = fs.statSync(comprimido).size
            await client.sendMessage(from, {
                video: { url: comprimido },
                caption: caption + `\n\n📉 _Reduzido de ${mb(tamanho)} para ${mb(novoTam)} MB para abrir direto na sua galeria._\n💡 _Quer o arquivo original em máxima qualidade? Use_ \`-doc\` _no comando._`,
                mimetype: 'video/mp4'
            }, { quoted: info, mediaUploadTimeoutMs: 300000 })
            return { modo: 'video-comprimido' }
        } finally {
            try { fs.unlinkSync(comprimido) } catch (_) {}
        }
    }

    // 4. Nem comprimindo coube — só resta o arquivo.
    return comoDocumento(`📦 *Enviado como arquivo (${mb(tamanho)} MB)* — grande demais para a galeria do WhatsApp (limite ~${mb(LIMITE_GALERIA)} MB).`)
}

module.exports = { enviarVideo, comprimirParaGaleria, LIMITE_GALERIA }
