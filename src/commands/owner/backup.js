/**
 * Comando .backup
 * Cria um snapshot consistente do SQLite a quente com metadados e envia para o Dono
 */

const fs = require('fs')
const path = require('path')
const { createBackup, BACKUP_DIR } = require('../../services/backupService')
const logger = require('../../core/logger')

module.exports = {
    name: 'backup',
    aliases: ['dump', 'bkp', 'snapshot'],
    category: 'owner',
    description: 'Gera um snapshot consistente a quente do banco SQLite e envia para o dono',
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, client, reply }) => {
        try {
            await reply('📦 Gerando snapshot atômico do banco de dados (VACUUM INTO)...')
            const metadata = createBackup()

            const backupFilePath = path.join(BACKUP_DIR, metadata.filename)
            const dbBuffer = fs.readFileSync(backupFilePath)

            const { getBotName } = require('../../config/botConfig')
            const botName = getBotName()
            let caption = `💾 *BACKUP DO ${botName.toUpperCase()} (SQLite)*\n\n`
            caption += `📌 *Arquivo:* \`${metadata.filename}\`\n`
            caption += `📦 *Tamanho:* ${metadata.sizeKb} KB\n`
            caption += `👥 *Usuários:* ${metadata.stats.users}\n`
            caption += `⏰ *Agendamentos:* ${metadata.stats.schedules}\n`
            caption += `⏱️ *Data:* ${new Date(metadata.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`

            await client.sendMessage(from, {
                document: dbBuffer,
                fileName: metadata.filename,
                mimetype: 'application/x-sqlite3',
                caption: caption.trim()
            })
        } catch (err) {
            logger.error('[BACKUP COMMAND ERROR]', err)
            reply(`❌ Falha ao processar backup: ${err.message}`)
        }
    }
}
