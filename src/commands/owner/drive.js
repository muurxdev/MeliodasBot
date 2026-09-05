/**
 * Comando .drive — status da integração com o Google Drive.
 *
 * Serve para responder rápido "por que o bot mandou como documento em vez de
 * link?": ou não está configurado, ou a conta encheu, ou o disco da VPS apertou.
 */

const drive = require('../../services/drive/googleDriveService')
const diskGuard = require('../../services/drive/diskGuard')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')

const tb = n => (Number(n) / 1024 ** 4).toFixed(2)
const gb = n => (Number(n) / 1024 ** 3).toFixed(1)

function barra(fracao, largura = 12) {
    const cheio = Math.max(0, Math.min(largura, Math.round(fracao * largura)))
    return '█'.repeat(cheio) + '░'.repeat(largura - cheio)
}

module.exports = {
    name: 'drive',
    aliases: ['gdrive', 'statusdrive'],
    category: 'owner',
    subcategory: 'Infraestrutura',
    description: 'Mostra o status do Google Drive (cota, pasta) e o disco da VPS',
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply, text }) => {
        if (!drive.isConfigured()) {
            return reply(
                '☁️ *GOOGLE DRIVE — não configurado*\n\n' +
                'Sem ele, vídeos acima de ~16 MB só chegam comprimidos ou como documento.\n\n' +
                '*Para ligar:*\n' +
                '1️⃣ `node scripts/google-drive-auth.js <ID> <SECRET>`\n' +
                '2️⃣ `node scripts/google-drive-check.js`\n' +
                '3️⃣ Colar as variáveis `GDRIVE_*` no `.env` e reiniciar\n\n' +
                '⚠️ _Não use Service Account: ela tem cota própria de 15 GB e não herda o seu plano._'
            )
        }

        try {
            const q = await drive.getQuota()
            const disco = await diskGuard.espacoLivre(tempDir)

            let msg = '☁️ *GOOGLE DRIVE*\n\n'
            msg += `👤 Conta: \`${q.email || 'desconhecida'}\`\n`

            if (q.limite === null) {
                msg += '💾 Armazenamento: *ilimitado*\n'
            } else {
                const usoFrac = q.usado / q.limite
                msg += `💾 ${tb(q.usado)} TB de ${tb(q.limite)} TB\n`
                msg += `${barra(usoFrac)} ${(usoFrac * 100).toFixed(1)}%\n`
                msg += `🆓 Livre: *${tb(q.livre)} TB*\n`
            }

            msg += `📁 Pasta: \`${process.env.GDRIVE_FOLDER_ID || 'raiz do Drive'}\`\n`

            if (disco) {
                const discoFrac = 1 - disco.livre / disco.total
                msg += `\n🖥️ *DISCO DA VPS*\n`
                msg += `${barra(discoFrac)} ${(discoFrac * 100).toFixed(0)}% usado\n`
                msg += `🆓 Livre: *${gb(disco.livre)} GB* de ${gb(disco.total)} GB\n`

                const maiorArquivo = (disco.livre - diskGuard.RESERVA_BYTES) / diskGuard.FATOR_MERGE
                msg += maiorArquivo > 0
                    ? `📥 Maior download possível agora: *~${gb(maiorArquivo)} GB*\n`
                    : '⚠️ *Disco apertado* — downloads grandes serão recusados.\n'
            }

            if (/limpar/i.test(text || '')) {
                const r = await diskGuard.limparAntigos(tempDir)
                msg += `\n🧹 Limpeza: ${r.removidos} arquivo(s), ${gb(r.bytesLiberados)} GB liberados\n`
            } else {
                msg += '\n💡 _Use_ `.drive limpar` _para apagar temporários com mais de 6h._'
            }

            return reply(msg)
        } catch (e) {
            logger.error(`[DRIVE CMD] ${e.message}`)
            return reply(
                `❌ *Falha ao consultar o Drive.*\n\n_${e.message}_\n\n` +
                '💡 _Se der `invalid_grant`, o refresh token foi revogado: rode_ `google-drive-auth.js` _de novo._'
            )
        }
    }
}
