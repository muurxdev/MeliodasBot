/**
 * Utilitário de Erros do yt-dlp
 * Extrai a causa raiz da saída de erro do yt-dlp/FFmpeg para diagnóstico real
 * (URL inválida, extrator quebrado, 403/429, geo-restrição, login necessário, etc.)
 * sem esconder o stderr e sem expor credenciais (linhas ERROR já não contêm tokens).
 */

const MAX_DETAIL_LENGTH = 300

/**
 * Extrai as últimas linhas relevantes de erro ("ERROR: ...") do stderr
 * @param {string} stderr - Saída padrão de erro do processo
 * @returns {string}
 */
function lastErrorLines(stderr) {
    if (!stderr || typeof stderr !== 'string') return ''
    const lines = stderr.split('\n')
        .map(l => l.trim())
        .filter(l => /^(ERROR|WARNING: |Unsupported|Sign in|Got error|HTTP Error)/i.test(l))
    if (lines.length === 0) return ''
    return lines.slice(-2).join(' | ').slice(0, MAX_DETAIL_LENGTH)
}

/**
 * Constrói a mensagem de erro final acrescentando a causa real do stderr
 * @param {string} base - Mensagem genérica amigável
 * @param {string} stderr - Saída de erro do processo
 * @returns {string}
 */
function toMessage(base, stderr) {
    if (stderr && /Sign in to confirm you['']re not a bot/i.test(stderr)) {
        let msg = `⚠️ *Restrição Anti-Bot do YouTube no IP da VPS.*\n\n`
        msg += `💡 *Soluções Rápidas:*\n`
        msg += `• 🎵 *Áudio/Música:* Use \`.play <música>\` ou \`.spotify <link>\` (sem bloqueio).\n`
        msg += `• 🍪 *Cookie pessoal:* Envie seus cookies com \`.cookies\` (cada usuário pode usar o seu).\n`
        msg += `• 👑 *Cookie global:* O Dono pode setar com \`.cookies global <conteúdo>\`.`
        return msg
    }
    if (stderr && /HTTP Error 403/i.test(stderr)) {
        return `${base}\n🗒️ *Detalhe:* Acesso negado (403). Tente com outro formato ou use \`.cookies\` para autenticar.`
    }
    if (stderr && /HTTP Error 429/i.test(stderr)) {
        return `${base}\n🗒️ *Detalhe:* Rate limit atingido (429). Aguarde alguns minutos e tente novamente.`
    }
    if (stderr && /Requested format is not available/i.test(stderr)) {
        return `${base}\n🗒️ *Detalhe:* O formato solicitado não está disponível para este vídeo. Tente outro formato.`
    }
    const detail = lastErrorLines(stderr)
    return detail ? `${base}\n🗒️ *Detalhe:* ${detail}` : base
}

/**
 * Verifica se a saída indica binário ausente (ENOENT no spawn)
 * @param {object} err - Erro do evento 'error' do child_process
 * @returns {boolean}
 */
function isMissingBinary(err) {
    return err && (err.code === 'ENOENT' || /spawn .* ENOENT/i.test(err.message || ''))
}

module.exports = { lastErrorLines, toMessage, isMissingBinary, MAX_DETAIL_LENGTH }
