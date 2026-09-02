/**
 * MeliodasBot — Comando .opendm
 * Desbane ou libera o privado do bot para usuários (aceita números formatados, menções ou 'all')
 */

const { permissionRepo } = require('../../services/permissionService')
const dataService = require('../../services/dataService')
const logger = require('../../core/logger')

module.exports = {
    name: 'opendm',
    aliases: ['desbanirdm', 'unbandm', 'liberardm'],
    category: 'owner',
    description: 'Desbane um usuário ou libera o privado do bot',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ text = '', info, args = [], reply, sender, quotedSender }) => {
        const fullInput = (text || args.join(' ')).trim()

        const configs = dataService.getConfigsData()
        if (!configs['global']) configs['global'] = {}

        // 1. Desbanir todos / Limpar todos os bloqueios de DM
        if (args[0] === 'all' || args[0] === 'todos' || fullInput === 'all' || fullInput === 'todos' || args[0] === 'clear' || args[0] === 'limpar') {
            configs['global'].blockAllDMs = false
            await dataService.saveConfigsData(configs)
            const list = permissionRepo.getAllDmBlocked()
            list.forEach(item => permissionRepo.setDmBlocked(item.jid, false))
            logger.info(`[OPENDM] ${sender} liberou o PV globalmente e removeu todos os ${list.length} bans de DM.`)
            return reply(`🔓 *PRIVADO 100% LIBERADO:*\n\n✅ O bloqueio global foi *DESATIVADO*.\n✅ Todos os ${list.length} bans individuais de DM foram *REMOVIDOS*.`)
        }

        // 2. Extração inteligente do JID alvo (menção, quotedSender ou número com formatação)
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        let targetJid = mentioned || quotedSender || null

        if (!targetJid) {
            const digits = fullInput.replace(/\D/g, '')
            if (digits.length >= 8) {
                targetJid = `${digits}@s.whatsapp.net`
            }
        }

        if (!targetJid) {
            return reply('❌ Informe o usuário que deseja desbanir do privado ou use `all`.\n\n📌 *Exemplos:*\n• `.opendm @usuario`\n• `.opendm +55 11 99988-0200`\n• `.opendm 5511999880200`\n• `.opendm all`')
        }

        // Remove do banco relacional de forma garantida
        permissionRepo.setDmBlocked(targetJid, false)
        const userNum = targetJid.split('@')[0]

        logger.info(`[OPENDM] ${sender} desbaniu DM para ${targetJid}`)
        return reply(`🔓 *DM DESBLOQUEADA COM SUCESSO!*\n\n👤 *Usuário:* @${userNum}\n🛡️ *Desbanido por:* @${sender.split('@')[0]}\n\n_O usuário agora pode conversar e usar comandos no privado normalmente._`, [targetJid, sender])
    }
}
