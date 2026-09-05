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
const drive = require('../drive/googleDriveService')

// Limite seguro para chegar na galeria de qualquer aparelho.
const LIMITE_GALERIA = Number(process.env.WHATSAPP_MEDIA_MAX_BYTES || 16 * 1024 * 1024)

// Acima disso, mandar como documento é hostil: o download trava no celular e o
// arquivo não abre na galeria. Se o Drive estiver configurado, ele assume.
const LIMITE_DOCUMENTO = Number(process.env.WHATSAPP_DOC_MAX_BYTES || 2000 * 1024 * 1024)

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
 * Sobe o arquivo original para o Drive, mostrando o progresso no WhatsApp.
 *
 * Um upload de 3 GB leva minutos. Sem feedback o usuário acha que o bot travou
 * e repete o comando — o que dobra o trabalho da VPS. Por isso editamos uma
 * única mensagem de status em vez de mandar várias.
 *
 * @returns {Promise<{visualizar:string, baixar:string}>}
 */
async function enviarParaDrive({ client, from, filePath, fileName, tamanho }) {
    // Recusa antes de gastar banda se a conta do dono estiver cheia.
    const quota = await drive.getQuota()
    if (quota.livre < tamanho * 1.05) {
        throw new Error(`Sem espaço no Drive: faltam ${mb(tamanho - quota.livre)} MB`)
    }

    const status = await client.sendMessage(from, {
        text: `☁️ *Enviando para o Drive...*\n${mb(tamanho)} MB — 0%`
    })

    let ultimoMarco = 0
    const onProgress = (pct) => {
        // Edita de 10 em 10%: o WhatsApp limita edições e uma barra de progresso
        // byte a byte viraria flood.
        if (pct < ultimoMarco + 10 && pct < 100) return
        ultimoMarco = pct
        const barra = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10))
        client.sendMessage(from, {
            edit: status.key,
            text: `☁️ *Enviando para o Drive...*\n${mb(tamanho)} MB\n\n${barra} ${pct}%`
        }).catch(e => logger.warn(`[VIDEO SENDER] Não editei o status: ${e.message}`))
    }

    const r = await drive.enviarECompartilhar({
        filePath, fileName, mimeType: 'video/mp4', onProgress
    })

    await client.sendMessage(from, {
        edit: status.key,
        text: `☁️ *Enviado para o Drive* — ${mb(tamanho)} MB ✅`
    }).catch(e => logger.warn(`[VIDEO SENDER] Não editei o status final: ${e.message}`))

    return { visualizar: r.visualizar, baixar: r.baixar }
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

    // 3. Grande demais para a galeria. Se o Drive estiver ligado, ele guarda o
    //    ORIGINAL (sem limite de tamanho nem de resolução) e devolve um link.
    let linkDrive = null
    if (drive.isConfigured()) {
        try {
            linkDrive = await enviarParaDrive({ client, from, filePath, fileName: nome, tamanho })
        } catch (e) {
            // Drive fora do ar não pode impedir a entrega: cai para os modos
            // antigos (comprimir / documento).
            logger.warn(`[VIDEO SENDER] Drive falhou, seguindo sem ele: ${e.message}`)
        }
    }

    // 4. Comprime para caber e chegar na galeria. Mesmo com o link do Drive
    //    isso vale a pena: o usuário assiste na hora e usa o link só se quiser
    //    a qualidade cheia.
    let comprimido = null
    try {
        comprimido = await comprimirParaGaleria(filePath)
    } catch (e) {
        logger.warn(`[VIDEO SENDER] Falha ao comprimir: ${e.message}`)
    }

    if (comprimido) {
        try {
            const novoTam = fs.statSync(comprimido).size
            const nota = linkDrive
                ? `\n\n📉 _Prévia reduzida de ${mb(tamanho)} para ${mb(novoTam)} MB para tocar aqui._\n\n` +
                  `☁️ *Original em qualidade máxima (${mb(tamanho)} MB):*\n` +
                  `▶️ Assistir: ${linkDrive.visualizar}\n` +
                  `⬇️ Baixar: ${linkDrive.baixar}`
                : `\n\n📉 _Reduzido de ${mb(tamanho)} para ${mb(novoTam)} MB para abrir direto na sua galeria._\n` +
                  `💡 _Quer o arquivo original em máxima qualidade? Use_ \`-doc\` _no comando._`

            await client.sendMessage(from, {
                video: { url: comprimido },
                caption: caption + nota,
                mimetype: 'video/mp4'
            }, { quoted: info, mediaUploadTimeoutMs: 300000 })
            return { modo: linkDrive ? 'video-comprimido+drive' : 'video-comprimido', drive: linkDrive }
        } finally {
            try { fs.unlinkSync(comprimido) } catch (e) {
                logger.warn(`[VIDEO SENDER] Não removi o temporário ${comprimido}: ${e.message}`)
            }
        }
    }

    // 5. Não deu para comprimir, mas o Drive guardou: manda só o link.
    if (linkDrive) {
        await client.sendMessage(from, {
            text: caption +
                `\n\n☁️ *Arquivo de ${mb(tamanho)} MB — grande demais para o WhatsApp.*\n` +
                `Guardei no Drive em qualidade máxima:\n\n` +
                `▶️ Assistir: ${linkDrive.visualizar}\n` +
                `⬇️ Baixar: ${linkDrive.baixar}`
        }, { quoted: info })
        return { modo: 'drive', drive: linkDrive }
    }

    // 6. Sem Drive e sem compressão: acima de 2 GB o WhatsApp nem aceita.
    if (tamanho > LIMITE_DOCUMENTO) {
        await client.sendMessage(from, {
            text: `❌ *Arquivo grande demais* (${mb(tamanho)} MB).\n\n` +
                  `O WhatsApp aceita no máximo ${mb(LIMITE_DOCUMENTO)} MB e não consegui reduzir o vídeo.\n` +
                  `💡 _Configure o Google Drive no bot para receber arquivos deste tamanho por link._`
        }, { quoted: info })
        return { modo: 'recusado' }
    }

    // 7. Último caso: manda o arquivo mesmo.
    return comoDocumento(`📦 *Enviado como arquivo (${mb(tamanho)} MB)* — grande demais para a galeria do WhatsApp (limite ~${mb(LIMITE_GALERIA)} MB).`)
}

module.exports = { enviarVideo, comprimirParaGaleria, LIMITE_GALERIA }
