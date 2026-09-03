const { DatabaseSync } = require('node:sqlite')
const path = require('path')
const fs = require('fs')
const { dataDir } = require('../config/paths')
const logger = require('../core/logger')

let dbInstance = null

// Cache de prepared statements por SQL. node:sqlite não expõe .transaction()
// e getDatabase() é lazy, então não dá para preparar em escopo de módulo.
// Memoizar por string de SQL evita recompilar o mesmo statement a cada chamada.
const _stmtCache = new Map()

function q(sql) {
    let stmt = _stmtCache.get(sql)
    if (!stmt) {
        stmt = getDatabase().prepare(sql)
        _stmtCache.set(sql, stmt)
    }
    return stmt
}

function getDatabase(dbPath = null) {
    if (dbInstance) return dbInstance

    const targetPath = dbPath || path.join(dataDir, 'database.sqlite')

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }

    function initDb(filePath) {
        const db = new DatabaseSync(filePath)
        db.exec('PRAGMA journal_mode = WAL;')
        db.exec('PRAGMA synchronous = NORMAL;')
        db.exec('PRAGMA foreign_keys = ON;')
        db.exec('PRAGMA temp_store = MEMORY;')
        db.exec('PRAGMA cache_size = -32000;')   // ~32MB de cache de páginas
        db.exec('PRAGMA mmap_size = 268435456;') // 256MB de I/O mapeado em memória
        db.exec('PRAGMA busy_timeout = 5000;')   // espera locks em vez de falhar na hora

        // Quick integrity check
        const check = db.prepare('PRAGMA quick_check;').get()
        if (check && check.quick_check !== 'ok') {
            throw new Error('Integrity check failed: ' + JSON.stringify(check))
        }

        const { runMigrations } = require('./migrator')
        runMigrations(db)
        return db
    }

    try {
        dbInstance = initDb(targetPath)
        logger.info(`💾 Conexão SQLite estabelecida com sucesso: ${targetPath}`)
        return dbInstance
    } catch (err) {
        logger.error(`⚠️ SQLite corrompido ou com falha (${err.message}). Executando auto-recuperação segura...`)
        try {
            if (fs.existsSync(targetPath)) {
                const backupPath = path.join(dataDir, `database_corrupted_${Date.now()}.sqlite`)
                fs.renameSync(targetPath, backupPath)
                // Remove stale WAL and SHM files
                try { fs.unlinkSync(targetPath + '-wal') } catch (_) {}
                try { fs.unlinkSync(targetPath + '-shm') } catch (_) {}
                logger.info(`📦 Banco corrompido movido para ${backupPath}`)
            }

            _stmtCache.clear()
            dbInstance = initDb(targetPath)
            logger.info(`💾 Novo banco SQLite inicializado e recuperado com sucesso: ${targetPath}`)
            return dbInstance
        } catch (recoverErr) {
            logger.error(`❌ Falha crítica na auto-recuperação do SQLite:`, recoverErr)
            throw recoverErr
        }
    }
}

function closeDatabase() {
    if (dbInstance) {
        try {
            _stmtCache.clear()
            dbInstance.close()
            dbInstance = null
            logger.info('💾 Conexão SQLite encerrada.')
        } catch (e) {
            logger.error('Erro ao fechar conexão SQLite:', e)
        }
    }
}

module.exports = {
    getDatabase,
    closeDatabase,
    q
}
