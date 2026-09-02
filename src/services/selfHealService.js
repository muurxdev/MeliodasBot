/**
 * MeliodasBot — Self-Healing & Diagnostic Engine
 * Motor autônomo de diagnóstico, reparação de integridade, limpeza e otimização
 */

const fs = require("fs");
const path = require("path");
const { getDatabase } = require("../database/connection");
const { tempDir, dataDir } = require("../config/paths");
const { checkMediaEnv } = require("./media/mediaEnvCheck");
const { validateCookiesFile, getCookiesFilePath } = require("./media/mediaArgs");
const { getAllMenuMediaStatus } = require("../utils/wallpapers");
const { loadCommands } = require("../handlers/commandDispatcher");
const logger = require("../core/logger");

/**
 * Executa uma varredura completa de diagnóstico e auto-reparação
 * @returns {Promise<{ repaired: string[], warnings: string[], stats: object, allHealthy: boolean }>}
 */
async function runSelfHeal() {
    const repaired = [];
    const warnings = [];
    const stats = {};

    logger.info("[SELF-HEAL] Iniciando rotina autônoma de diagnóstico e auto-reparação...");

    // 1. VERIFICAÇÃO E REPARO DO BANCO SQLITE
    try {
        const db = getDatabase();
        const row = db.prepare("PRAGMA integrity_check").get();
        if (row && (row.integrity_check === "ok" || Object.values(row)[0] === "ok")) {
            stats.sqliteIntegrity = "100% Íntegro";
        } else {
            warnings.push("Aviso de integridade no SQLite: " + JSON.stringify(row));
        }

        // Checkpoint WAL e Otimização
        try {
            db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
            db.exec("PRAGMA optimize;");
            repaired.push("Banco SQLite otimizado e checkpoint WAL concluído com sucesso.");
        } catch (_) {}

        // Recuperação de agendamentos zumbis/presos
        try {
            const staleSched = db.prepare("UPDATE bot_schedules SET status = 'CANCELLED' WHERE status = 'EXECUTING' AND expires_at < ?").run(new Date().toISOString());
            if (staleSched.changes > 0) {
                repaired.push(`Corrigidos ${staleSched.changes} agendamentos expirados presos no estado EXECUTING.`);
            }
        } catch (_) {}
    } catch (dbErr) {
        warnings.push(`Erro ao inspecionar SQLite: ${dbErr.message}`);
    }

    // 2. LIMPEZA DE ARQUIVOS TEMPORÁRIOS E LOCKS
    try {
        let tempFilesDeleted = 0;
        if (fs.existsSync(tempDir)) {
            const cleanDirRecursive = (dirPath) => {
                let count = 0;
                for (const item of fs.readdirSync(dirPath)) {
                    const fullPath = path.join(dirPath, item);
                    try {
                        const stat = fs.statSync(fullPath);
                        if (stat.isDirectory()) {
                            count += cleanDirRecursive(fullPath);
                            try { fs.rmdirSync(fullPath); } catch (_) {}
                        } else if (Date.now() - stat.mtimeMs > 15 * 60 * 1000) {
                            fs.unlinkSync(fullPath);
                            count++;
                        }
                    } catch (_) {}
                }
                return count;
            };
            tempFilesDeleted = cleanDirRecursive(tempDir);
        }
        if (tempFilesDeleted > 0) {
            repaired.push(`Limpeza profunda: ${tempFilesDeleted} arquivos temporários antigos removidos.`);
        }
        stats.tempCleaned = tempFilesDeleted;
    } catch (tempErr) {
        warnings.push(`Erro na limpeza temporária: ${tempErr.message}`);
    }

    // 3. AUDITORIA E RECARREGAMENTO DINÂMICO DE COMANDOS
    try {
        const { commands, aliases } = require("../handlers/commandDispatcher");
        loadCommands();
        stats.totalCommands = commands.size;
        stats.totalAliases = aliases.size;
        repaired.push(`Índice de comandos auditado: ${stats.totalCommands} comandos canônicos e ${stats.totalAliases} aliases ativos.`);
    } catch (cmdErr) {
        warnings.push(`Erro ao auditar comandos: ${cmdErr.message}`);
    }

    // 4. VERIFICAÇÃO DO AMBIENTE DE MÍDIA (FFmpeg / FFprobe / yt-dlp)
    try {
        const mediaEnv = await checkMediaEnv();
        stats.ffmpeg = mediaEnv.ffmpeg?.ok ? "OK" : "AUSENTE";
        stats.ffprobe = mediaEnv.ffprobe?.ok ? "OK" : "AUSENTE";
        stats.ytdlp = mediaEnv.ytDlp?.ok ? "OK" : "AUSENTE";

        if (!mediaEnv.ffmpeg?.ok) warnings.push("FFmpeg não encontrado no PATH do sistema.");
        if (!mediaEnv.ffprobe?.ok) warnings.push("FFprobe não encontrado no PATH do sistema.");
    } catch (mErr) {
        warnings.push(`Erro ao checar binários de mídia: ${mErr.message}`);
    }

    // 5. AUDITORIA DE COOKIES E AUTENTICAÇÃO DE MÍDIAS
    try {
        const cookieStatus = validateCookiesFile(getCookiesFilePath());
        if (cookieStatus.ok) {
            stats.cookies = `Ativo (${cookieStatus.count} linhas, domínio: ${cookieStatus.domain})`;
        } else {
            stats.cookies = "Ausente/Opcional (Acesso Anônimo Ativo)";
        }
    } catch (_) {
        stats.cookies = "Não configurado";
    }

    // 6. INTEGRIDADE DOS WALLPAPERS E COVERS DE ANIME
    try {
        const wpStatus = getAllMenuMediaStatus();
        const activeVideos = wpStatus.filter(c => c.type === "video").length;
        stats.wallpapers = `${activeVideos}/${wpStatus.length} Menus com Vídeo HD Ativo`;
    } catch (_) {}

    // 7. ESTATÍSTICAS DE MEMÓRIA E UPTIME
    const mem = process.memoryUsage();
    stats.rss = (mem.rss / 1024 / 1024).toFixed(1) + " MB";
    stats.heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1) + " MB";
    stats.uptime = Math.floor(process.uptime() / 60) + "m " + Math.floor(process.uptime() % 60) + "s";

    const allHealthy = warnings.length === 0;

    return {
        repaired,
        warnings,
        stats,
        allHealthy
    };
}

module.exports = {
    runSelfHeal
};
