/**
 * Envio inteligente de vídeo no WhatsApp.
 *
 * DIRETRIZES:
 * 1. Até 100 MB  -> Manda direto como VÍDEO completo e original na conversa/galeria (sem rebaixar resolução nem comprimir).
 * 2. > 100 MB    -> Manda como DOCUMENTO / ARQUIVO na íntegra preservando 100% da qualidade original.
 * 3. > 2 GB      -> Sobe para o Google Drive 5TB com link da pasta e links de visualização/download direto.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const drive = require('../drive/googleDriveService')

// Limite para envio direto como vídeo (até 100 MB toca direto na conversa/galeria)
const LIMITE_GALERIA = Number(process.env.WHATSAPP_MEDIA_MAX_BYTES || 100 * 1024 * 1024)

// Limite para envio via documento/arquivo (até 2 GB)
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
 * Função utilitária de compressão mantida para compatibilidade
 */
async function comprimirParaGaleria(origem, limiteBytes = LIMITE_GALERIA) {
    const saida = path.join(tempDir, `galeria_${Date.now()}.mp4`)
    const ok = await _ffmpeg([
        '-y', '-i', origem,
        '-c:v', 'libx264', '-crf', '24', '-preset', 'veryfast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        saida
    ])
    if (ok && fs.existsSync(saida)) return saida
    return null
}

/**
 * Sobe o arquivo original para o Drive, mostrando o progresso no WhatsApp.
 *
 * @returns {Promise<{visualizar:string, baixar:string, folderId:string, folderUrl:string}>}
 */
async function enviarParaDrive({ client, from, filePath, fileName, tamanho }) {
    const quota = await drive.getQuota()
    if (quota.livre < tamanho * 1.05) {
        throw new Error(`Sem espaço no Drive: faltam ${mb(tamanho - quota.livre)} MB`)
    }

    const status = await client.sendMessage(from, {
        text: `☁️ *Enviando para o Drive...*\n${mb(tamanho)} MB — 0%`
    })

    let ultimoMarco = 0
    const onProgress = (pct) => {
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

    return {
        visualizar: r.visualizar,
        baixar: r.baixar,
        folderId: r.folderId,
        folderUrl: r.folderUrl
    }
}

/**
 * Envia o vídeo completo na íntegra.
 *
 * @param {object} o
 * @param {boolean} [o.preferirDocumento] usuário pediu envio como arquivo (flag -doc)
 * @returns {Promise<{modo:'video'|'documento'|'drive'|'recusado'}>}
 */
async function enviarVideo({ client, from, filePath, caption = '', info, fileName, preferirDocumento = false }) {
    const tamanho = fs.statSync(filePath).size
    const nome = fileName || path.basename(filePath)

    const comoDocumento = async (nota) => {
        const uploadTimeoutMs = Math.min(1800000, Math.max(600000, Math.round((tamanho / (1024 * 1024)) * 2500)))
        await client.sendMessage(from, {
            document: { url: filePath },
            mimetype: 'video/mp4',
            fileName: nome,
            caption: (caption ? caption + '\n\n' : '') + (nota || '')
        }, { quoted: info, mediaUploadTimeoutMs: uploadTimeoutMs })
        return { modo: 'documento' }
    }

    // 0. Arquivos maiores que 2GB (Teto máximo do WhatsApp) -> Google Drive 5TB
    if (tamanho > LIMITE_DOCUMENTO) {
        if (drive.isConfigured()) {
            try {
                const linkDrive = await enviarParaDrive({ client, from, filePath, fileName: nome, tamanho })
                let docMsg = `╔══════════════════════════════╗\n`
                docMsg += `║   ☁️ *ARQUIVO SALVO NO DRIVE (5TB)*   ║\n`
                docMsg += `╚══════════════════════════════╝\n\n`
                if (caption) docMsg += `${caption}\n\n`
                docMsg += `📦 *Nome:* \`${nome}\`\n`
                docMsg += `📊 *Tamanho:* *${mb(tamanho)} MB* (~${(tamanho / (1024 * 1024 * 1024)).toFixed(2)} GB)\n\n`
                docMsg += `⚠️ *Aviso:* Este arquivo ultrapassa o limite de 2GB do WhatsApp. Por isso, foi armazenado com 100% de integridade e sem perdas no seu Google Drive de 5TB.\n\n`
                docMsg += `╭━〔 🔗 *LINKS DE ACESSO* 〕━⬣\n`
                if (linkDrive.folderUrl) {
                    docMsg += `┃ 📁 *Pasta no Drive:* ${linkDrive.folderUrl}\n`
                }
                docMsg += `┃ ▶️ *Visualizar Online:* ${linkDrive.visualizar}\n`
                docMsg += `┃ ⬇️ *Download Direto:* ${linkDrive.baixar}\n`
                docMsg += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`
                docMsg += `💡 _Você pode abrir a pasta para navegar por todos os seus downloads ou baixar o arquivo original diretamente pelo link!_`

                await client.sendMessage(from, { text: docMsg.trim() }, { quoted: info })
                return { modo: 'drive', drive: linkDrive }
            } catch (err) {
                logger.error(`[VIDEO SENDER] Falha ao enviar para o Drive (>2GB): ${err.message}`)
                await client.sendMessage(from, {
                    text: `❌ *Falha ao subir arquivo de ${mb(tamanho)} MB para o Drive:*\n_${err.message}_`
                }, { quoted: info })
                return { modo: 'recusado' }
            }
        } else {
            await client.sendMessage(from, {
                text: `❌ *Arquivo grande demais* (${mb(tamanho)} MB).\n\n` +
                      `O WhatsApp possui limite de 2.000 MB (2 GB) por arquivo e o Google Drive de 5TB não está configurado nesta instância do bot.\n`
            }, { quoted: info })
            return { modo: 'recusado' }
        }
    }

    // 1. Até 100MB: manda DIRETO como VÍDEO completo e original na conversa! Sem compressão, sem perda!
    if (tamanho <= LIMITE_GALERIA && !preferirDocumento) {
        await client.sendMessage(from, {
            video: { url: filePath },
            caption,
            mimetype: 'video/mp4'
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        return { modo: 'video' }
    }

    // 2. Acima de 100MB e até 2GB (ou se o usuário pediu explicitamente -doc): manda via ARQUIVO / DOCUMENTO!
    return comoDocumento(`📦 *Enviado como arquivo (${mb(tamanho)} MB)* — completo em máxima qualidade original.`)
}

module.exports = { enviarVideo, comprimirParaGaleria, LIMITE_GALERIA, LIMITE_DOCUMENTO }
