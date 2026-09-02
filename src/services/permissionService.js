/**
 * MeliodasBot — 5-Tier Permission & Hierarchy Service
 *
 * HIERARQUIA DE PERMISSÕES:
 * 5 - OWNER        (Dono do bot — controle absoluto de infraestrutura, bans globais e configurações)
 * 4 - BOT_ADMIN    (Administrador Global do bot — pode gerenciar moderação e promover até TRUSTED)
 * 3 - GROUP_ADMIN  (Administrador do Grupo WhatsApp — pode gerenciar antilink, kick e warns do grupo)
 * 2 - TRUSTED      (Usuário Confiável — isenções de limites de spam e acesso prioritário)
 * 1 - USER         (Usuário Comum — permissões padrão de comandos de economia e RPG)
 */

const env = require('../config/env')
const permissionRepo = require('../database/repositories/permissionRepository')
const logger = require('../core/logger')

const ROLES = {
    OWNER: 5,
    BOT_ADMIN: 4,
    GROUP_ADMIN: 3,
    TRUSTED: 2,
    USER: 1
}

const ROLE_NAMES = {
    5: 'OWNER',
    4: 'BOT_ADMIN',
    3: 'GROUP_ADMIN',
    2: 'TRUSTED',
    1: 'USER'
}

/**
 * Determina o nível de cargo (1 a 5) e o nome do cargo do remetente
 * @param {string} sender - JID do remetente
 * @param {boolean} isGroupAdmin - Se o remetente é admin do grupo WhatsApp
 * @param {boolean} isOwnerFlag - Se a flag de dono está ativa
 * @returns {{ level: number, name: string }}
 */
function resolveUserRole(sender, isGroupAdmin = false, isOwnerFlag = false) {
    const cleanSender = sender?.split(':')[0] || ''

    // 1. Checagem de Dono (Nível 5)
    if (isOwnerFlag === true || (isOwnerFlag !== false && env.isOwnerJid(cleanSender))) {
        return { level: ROLES.OWNER, name: 'OWNER' }
    }

    // 2. Checagem de Cargo no Banco de Dados SQLite
    const savedRole = permissionRepo.getUserRole(sender)
    if (savedRole?.role === 'OWNER') {
        return { level: ROLES.OWNER, name: 'OWNER' }
    }
    if (savedRole?.role === 'BOT_ADMIN') {
        return { level: ROLES.BOT_ADMIN, name: 'BOT_ADMIN' }
    }

    // 3. Checagem de Administrador de Grupo (Nível 3)
    if (isGroupAdmin) {
        return { level: ROLES.GROUP_ADMIN, name: 'GROUP_ADMIN' }
    }

    // 4. Checagem de Lista TRUSTED (Nível 2)
    if (savedRole?.role === 'TRUSTED' || permissionRepo.isTrusted(sender)) {
        return { level: ROLES.TRUSTED, name: 'TRUSTED' }
    }

    // 5. Usuário Comum (Nível 1)
    return { level: ROLES.USER, name: 'USER' }
}

/**
 * Promove um usuário para um cargo superior
 * Regras:
 * - Somente OWNER pode promover para BOT_ADMIN ou OWNER.
 * - BOT_ADMIN pode promover para TRUSTED.
 */
function promoteUser(targetJid, newRole, actorJid, actorRoleLevel) {
    const targetRole = newRole.toUpperCase()
    const targetLevel = ROLES[targetRole] || ROLES.TRUSTED

    if (targetLevel > actorRoleLevel) {
        throw new Error(`Permissão insuficiente: você não pode atribuir um cargo superior ou igual ao seu nível (${actorRoleLevel}).`)
    }

    if (targetLevel === ROLES.BOT_ADMIN && actorRoleLevel < ROLES.OWNER) {
        throw new Error('Somente o OWNER pode nomear BOT_ADMIN.')
    }

    permissionRepo.setUserRole(targetJid, targetRole, actorJid)
    if (targetRole === 'TRUSTED') {
        permissionRepo.setTrusted(targetJid, true, actorJid, 'Promovido via .up')
    }

    return {
        targetJid,
        role: targetRole,
        level: targetLevel
    }
}

/**
 * Rebaixa um usuário na hierarquia para USER
 */
function demoteUser(targetJid, actorJid, actorRoleLevel) {
    const currentTarget = resolveUserRole(targetJid)

    if (currentTarget.level >= actorRoleLevel && actorRoleLevel < ROLES.OWNER) {
        throw new Error('Permissão insuficiente: você não pode rebaixar alguém com nível igual ou superior ao seu.')
    }

    permissionRepo.removeUserRole(targetJid)
    permissionRepo.setTrusted(targetJid, false)

    return {
        targetJid,
        role: 'USER',
        level: ROLES.USER
    }
}

/**
 * Normaliza um JID removendo o sufixo de dispositivo preservando o domínio
 * ("639...:10@s.whatsapp.net" -> "639...@s.whatsapp.net")
 * @param {string} jid
 * @returns {string}
 */
function normalizeJid(jid = '') {
    if (typeof jid !== 'string' || !jid) return ''
    const at = jid.indexOf('@')
    if (at === -1) return jid.split(':')[0]
    return jid.slice(0, at).split(':')[0] + jid.slice(at)
}

/**
 * Verifica se o BOT é administrador do grupo com base no metadata E nos JIDs do bot.
 * Puro e testável: recebe o groupMetadata do Baileys e o JID (ou lista de JIDs) do bot.
 *
 * Estados suportados pelo Baileys: 'admin' e 'superadmin'.
 *
 * @param {object} groupMetadata - Retorno de client.groupMetadata(jid)
 * @param {string|string[]} botJids - JID(s) do bot (número real e/ou LID)
 * @returns {boolean}
 */
function isBotAdmin(groupMetadata, botJids) {
    if (!groupMetadata || !Array.isArray(groupMetadata.participants)) return false

    const ids = Array.isArray(botJids) ? botJids : [botJids]
    const normalized = new Set(ids.filter(Boolean).map(normalizeJid))

    return groupMetadata.participants.some(p => {
        if (!p || !p.id) return false
        const pid = normalizeJid(p.id)
        return normalized.has(pid) && (p.admin === 'admin' || p.admin === 'superadmin')
    })
}

/**
 * Avalia se o usuário possui permissão para executar um comando específico
 * @param {{ level: number, name: string }} userRole - Cargo do usuário
 * @param {object} cmd - Definição do comando
 * @param {object} context - Contexto da mensagem ({ isGroup, isBotAdmin })
 * @returns {{ allowed: boolean, reason?: string }}
 */
function canExecuteCommand(userRole, cmd, context = {}) {
    if (cmd.groupOnly && !context.isGroup) {
        return {
            allowed: false,
            reason: `👥 *COMANDO EXCLUSIVO DE GRUPO!*\n\n❌ O comando \`.${cmd.name}\` só pode ser executado dentro de grupos de WhatsApp autorizados.\n💡 *Dica:* Envie este comando em um grupo onde o bot está presente.`
        }
    }

    if (cmd.ownerOnly && userRole.level < ROLES.OWNER) {
        return {
            allowed: false,
            reason: `👑 *COMANDO EXCLUSIVO DOS DONOS DO BOT!*\n\n❌ O comando \`.${cmd.name}\` é de uso exclusivo dos 5 Donos oficiais do MeliodasBot.\n🎖️ *Hierarquia:* Requer patente de Dono / Fundador (Nível 5).\n💡 *Dica:* Digite \`.dono\` para visualizar os proprietários autorizados.`
        }
    }

    if (cmd.minRole && userRole.level < cmd.minRole) {
        const requiredRoleName = ROLE_NAMES[cmd.minRole] || `Nível ${cmd.minRole}`
        return {
            allowed: false,
            reason: `🔒 *ACESSO RESTRITO POR CARGO!*\n\n❌ O comando \`.${cmd.name}\` requer o cargo *${requiredRoleName}* ou superior.\n👤 *Seu cargo atual:* *${userRole.name}* (Nível ${userRole.level}).`
        }
    }

    if (cmd.adminOnly && userRole.level < ROLES.GROUP_ADMIN) {
        return {
            allowed: false,
            reason: `🛡️ *COMANDO EXCLUSIVO PARA ADMINISTRADORES!*\n\n❌ O comando \`.${cmd.name}\` é exclusivo para administradores deste grupo ou Donos do bot.\n💡 *Dica:* Solicite a um administrador do grupo para executar esta ação.`
        }
    }

    // `botAdminRequired` é a grafia legada de 11 comandos; nunca era lida.
    // Aceita ambas para aplicar a permissão que nunca rodou.
    if ((cmd.botAdminOnly || cmd.botAdminRequired) && !context.isBotAdmin) {
        return {
            allowed: false,
            reason: `⚡ *PERMISSÃO DO BOT NECESSÁRIA!*\n\n❌ O MeliodasBot precisa ser *Administrador do Grupo* para executar \`.${cmd.name}\`.\n💡 *Dica:* Promova o bot a admin para liberar esta função.`
        }
    }

    return { allowed: true }
}

module.exports = {
    ROLES,
    ROLE_NAMES,
    resolveUserRole,
    promoteUser,
    demoteUser,
    isBotAdmin,
    canExecuteCommand,
    permissionRepo
}
