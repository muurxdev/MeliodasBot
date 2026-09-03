/**
 * SQLite Hot Backup & Disaster Recovery Service
 * Cria snapshots atômicos a quente, gerencia metadados, rotação e restauração de dados.
 */

const fs = require('fs')
const path = require('path')
const { getDatabase, closeDatabase } = require('../database/connection')
const { files } = require('../config/paths')
const logger = require('../core/logger')

const BACKUP_DIR = path.resolve(__dirname, '../../backups')

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }
}

/**
 * Cria um snapshot a quente do banco de dados SQLite com metadados
 */
function createBackup(maxSnapshots = 7) {
    ensureBackupDir()

    const db = getDatabase()
    const timestamp = Date.now()
    const backupFileName = `meliodas_backup_${timestamp}.sqlite`
    const backupFilePath = path.join(BACKUP_DIR, backupFileName)
    const metaFilePath = path.join(BACKUP_DIR, `meliodas_backup_${timestamp}.meta.json`)

    try {
        // Executa VACUUM INTO para hot backup atômico e consistente
        db.exec(`VACUUM INTO '${backupFilePath}'`)

        const stats = fs.statSync(backupFilePath)

        // Coleta metadados operacionais
        let userCount = 0
        let scheduleCount = 0
        try {
            const uRow = db.prepare('SELECT COUNT(*) AS total FROM users').get()
            userCount = uRow ? uRow.total : 0
            const sRow = db.prepare('SELECT COUNT(*) AS total FROM bot_schedules').get()
            scheduleCount = sRow ? sRow.total : 0
        } catch (e) {}

        const metadata = {
            filename: backupFileName,
            sizeKb: Math.round(stats.size / 1024),
            createdAt: new Date(timestamp).toISOString(),
            timestamp,
            stats: {
                users: userCount,
                schedules: scheduleCount
            }
        }

        fs.writeFileSync(metaFilePath, JSON.stringify(metadata, null, 2), 'utf8')
        logger.info(`[BACKUP] Snapshot criado com sucesso: ${backupFileName} (${metadata.sizeKb} KB)`)

        // Rotação de backups antigos
        rotateBackups(maxSnapshots)

        return metadata
    } catch (err) {
        logger.error(`[BACKUP ERROR] Falha ao criar snapshot SQLite:`, err)
        throw new Error(`Erro ao gerar backup: ${err.message}`)
    }
}

/**
 * Rotação automática de backups para preservar espaço em disco na VPS
 */
function rotateBackups(maxSnapshots = 7) {
    ensureBackupDir()

    const allFiles = fs.readdirSync(BACKUP_DIR)
    const sqliteFiles = allFiles
        .filter(f => f.startsWith('meliodas_backup_') && f.endsWith('.sqlite'))
        .map(f => {
            const fullPath = path.join(BACKUP_DIR, f)
            return {
                filename: f,
                fullPath,
                mtime: fs.statSync(fullPath).mtimeMs
            }
        })
        .sort((a, b) => b.mtime - a.mtime)

    if (sqliteFiles.length > maxSnapshots) {
        const toDelete = sqliteFiles.slice(maxSnapshots)
        toDelete.forEach(item => {
            try {
                fs.unlinkSync(item.fullPath)
                const metaPath = item.fullPath.replace('.sqlite', '.meta.json')
                if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath)
                logger.info(`[BACKUP ROTATION] Backup antigo removido: ${item.filename}`)
            } catch (err) {
                logger.warn(`[BACKUP ROTATION] Falha ao remover ${item.filename}: ${err.message}`)
            }
        })
    }
}

/**
 * Lista todos os snapshots de backup disponíveis
 */
function listBackups() {
    ensureBackupDir()

    const allFiles = fs.readdirSync(BACKUP_DIR)
    const sqliteFiles = allFiles
        .filter(f => f.startsWith('meliodas_backup_') && f.endsWith('.sqlite'))
        .map(f => {
            const fullPath = path.join(BACKUP_DIR, f)
            const stats = fs.statSync(fullPath)
            const metaPath = path.join(BACKUP_DIR, f.replace('.sqlite', '.meta.json'))

            let meta = null
            if (fs.existsSync(metaPath)) {
                try {
                    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
                } catch (e) {}
            }

            return {
                filename: f,
                sizeKb: Math.round(stats.size / 1024),
                createdAt: stats.mtime.toISOString(),
                metadata: meta
            }
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return sqliteFiles
}

/**
 * Restaura um snapshot específico de backup
 */
function restoreBackup(backupFileName) {
    ensureBackupDir()

    const backupFilePath = path.join(BACKUP_DIR, backupFileName)
    if (!fs.existsSync(backupFilePath)) {
        throw new Error(`Arquivo de backup não encontrado: ${backupFileName}`)
    }

    const activeDbPath = files.database || path.resolve(__dirname, '../../data/database.sqlite')

    // 1. Fecha conexão SQLite para liberar handles de arquivo e flush
    closeDatabase()

    // 2. Snapshot de segurança pré-restauração
    const preRestoreSafety = path.join(BACKUP_DIR, `pre_restore_safety_${Date.now()}.sqlite`)
    if (fs.existsSync(activeDbPath)) {
        fs.copyFileSync(activeDbPath, preRestoreSafety)
    }

    // 3. Remove arquivos WAL e SHM órfãos para evitar inconsistência
    const walPath = `${activeDbPath}-wal`
    const shmPath = `${activeDbPath}-shm`
    if (fs.existsSync(walPath)) {
        try { fs.unlinkSync(walPath) } catch (e) {}
    }
    if (fs.existsSync(shmPath)) {
        try { fs.unlinkSync(shmPath) } catch (e) {}
    }

    // 4. Copia o snapshot restaurado
    fs.copyFileSync(backupFilePath, activeDbPath)

    // 5. Reabre conexão limpa
    getDatabase(activeDbPath)
    logger.info(`[BACKUP RESTORE] Banco de dados restaurado a partir de ${backupFileName}`)

    return {
        restoredFrom: backupFileName,
        safetyBackup: path.basename(preRestoreSafety)
    }
}

module.exports = {
    createBackup,
    listBackups,
    restoreBackup,
    rotateBackups,
    BACKUP_DIR
}

