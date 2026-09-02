/**
 * MeliodasBot — Comando .backuprestore
 * Restaura um snapshot específico do SQLite com criação automática de backup de segurança
 */

const { restoreBackup } = require('../../services/backupService')
const logger = require('../../core/logger')

module.exports = {
    name: 'backuprestore',
    aliases: ['restore', 'restaurar', 'bkprestore'],
    category: 'owner',
    description: 'Restaura a base SQLite a partir de um snapshot salvo',
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ text, reply }) => {
        if (!text) {
            return reply('❌ Informe o nome do arquivo de backup.\n\n📌 *Exemplo:* `.backuprestore meliodas_backup_1700000000000.sqlite`\n_Use `.backuplist` para ver os arquivos disponíveis._')
        }

        const filename = text.trim()

        try {
            await reply('⏳ Iniciando processo de restauração segura...')
            const res = restoreBackup(filename)

            let msg = `✅ *BANCO DE DADOS RESTAURADO COM SUCESSO!*\n\n`
            msg += `📌 *Snapshot Aplicado:* \`${res.restoredFrom}\`\n`
            msg += `🛡️ *Backup de Segurança Pré-Restauração:* \`${res.safetyBackup}\``

            await reply(msg)
        } catch (err) {
            logger.error('[BACKUP RESTORE ERROR]', err)
            reply(`❌ Falha na restauração: ${err.message}`)
        }
    }
}

