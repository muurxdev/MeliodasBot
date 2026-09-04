/**
 * 🌐 Clean Modular Architecture
 * Entry Point
 */

require('dotenv').config()

const logger = require('./core/logger')
const { registerShutdownHandlers } = require('./core/shutdown')
const { getDatabase } = require('./database/connection')
const { runMigrations } = require('./database/migrator')
const { importLegacyJsonData } = require('./database/importer')
const { loadCommands, commands, aliases, dispatch } = require('./handlers/commandDispatcher')
const { startBot, getClient } = require('./core/connection')
const dataService = require('./services/dataService')
const xpService = require('./services/xpService')
const rpgService = require('./services/rpgService')
const missionService = require('./services/missionService')
const { limparArquivosTemporarios } = require('./services/mediaService')
const { validateCookiesFile } = require('./services/media/mediaArgs')

async function bootstrap() {
    logger.info('==========================================')
    logger.info('🚀 Inicializando Bot v2.0...')
    logger.info('==========================================')

    // 1. Registrar tratamento de sinais e erros globais
    registerShutdownHandlers()

    // 2. Inicializar Banco de Dados SQLite & Executar Migrations
    try {
        const db = getDatabase()
        runMigrations(db)
        // Importador legado (JSON -> SQLite): relíquia da migração antiga. Ele roda
        // sempre que a tabela está vazia, então REPOPULAVA o banco a cada boot depois
        // de um reset — impossível "subir zerado". Agora só roda se pedirem
        // explicitamente via IMPORT_LEGACY_JSON=true.
        if (String(process.env.IMPORT_LEGACY_JSON || '').toLowerCase() === 'true') {
            logger.warn('📥 IMPORT_LEGACY_JSON=true — importando dados legados de JSON...')
            importLegacyJsonData(db)
        }
    } catch (errDb) {
        logger.error('❌ Falha na inicialização do banco de dados SQLite:', errDb)
    }

    // 3. Carregar todos os comandos modulares
    loadCommands()

    // 3.1 Limpar artefatos temporários de mídia órfãos de execuções anteriores
    try {
        limparArquivosTemporarios(6 * 60 * 60 * 1000)
    } catch (errTemp) {
        logger.warn('Aviso na limpeza de temporários no boot:', errTemp.message)
    }

    // 3.2 Validação do arquivo de cookies do yt-dlp (data/cookies.txt)
    try {
        const cookieStatus = validateCookiesFile()
        if (cookieStatus.ok) {
            logger.info(`✅ Cookies do yt-dlp válidos: ${cookieStatus.count} cookies (${cookieStatus.domain})`)
        } else {
            logger.warn(`⚠️ Cookies do yt-dlp: ${cookieStatus.reason}${cookieStatus.detail ? ` — ${cookieStatus.detail}` : ''}. Alguns vídeos/tiktok/instagram exigirão login real.`)
        }
    } catch (errCookie) {
        logger.warn('Aviso na validação de cookies no boot:', errCookie.message)
    }

    // 4. Inicializar Agendador de Ciclo de Vida (Bot Scheduler)
    try {
        const botScheduler = require('./services/botScheduler')
        botScheduler.initScheduler()
    } catch (errSched) {
        logger.error('❌ Falha ao inicializar Bot Scheduler:', errSched)
    }

    // 5. Iniciar conexão Baileys
    if (process.env.NODE_ENV !== 'test') {
        try {
            await startBot()
        } catch (err) {
            logger.error('❌ Falha na inicialização do socket:', err)
        }
    }
}

if (require.main === module) {
    bootstrap()
}

module.exports = {
    bootstrap,
    loadCommands,
    commands,
    aliases,
    dispatch,
    dataService,
    xpService,
    rpgService,
    missionService,
    getClient
}

