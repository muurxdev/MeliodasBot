/**
 * MeliodasBot — Comando .login / .registrar
 * Onboarding: o usuário se registra, define o nick pelo qual quer ser chamado e
 * escolhe se quer participar do RPG. Cada perfil fica salvo no banco, permitindo
 * contagem e separação corretas por função.
 */

const dataService = require('../../services/dataService')
const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: 'login',
    aliases: ['registrar', 'cadastrar', 'registro', 'perfilconfig', 'entrarbot'],
    category: 'general',
    subcategory: 'Perfil & Ranking',
    description: 'Registre-se no bot: defina seu nick e escolha se quer jogar RPG',
    cooldownMs: 2000,
    execute: async ({ sender, args, reply, prefix = '.' }) => {
        const botName = getBotName()
        const user = dataService.getUser(sender) || dataService.initializeUser(sender, {})
        const sub = (args[0] || '').toLowerCase().trim()

        // Sub-ação: ligar/desligar RPG
        if (sub === 'rpg') {
            const val = (args[1] || '').toLowerCase()
            user.rpgEnabled = !['off', 'nao', 'não', 'false', '0', 'desativar'].includes(val)
            user.registered = true
            if (!user.registeredAt) user.registeredAt = new Date().toISOString()
            dataService.saveUser(user)
            return reply(`${user.rpgEnabled ? '⚔️' : '🚫'} *RPG ${user.rpgEnabled ? 'ATIVADO' : 'DESATIVADO'}* no seu perfil.\n\n${user.rpgEnabled ? '_Agora você pode usar os comandos de RPG!_' : `_Comandos de RPG ficam ocultos. Reative com_ \`${prefix}login rpg on\``}`)
        }

        // Sub-ação: mudar o nick
        if (sub === 'nome' || sub === 'nick') {
            const novo = args.slice(1).join(' ').trim().slice(0, 40)
            if (!novo) return reply(`📝 *Uso:* \`${prefix}login nome <seu nick>\``)
            user.displayNick = novo
            user.registered = true
            if (!user.registeredAt) user.registeredAt = new Date().toISOString()
            dataService.saveUser(user)
            return reply(`✅ *Nick atualizado para:* ${novo}`)
        }

        // Registro direto com nick: .login <nick>
        const nick = args.join(' ').trim().slice(0, 40)
        if (nick) {
            const jaEra = user.registered
            user.displayNick = nick
            user.registered = true
            if (user.rpgEnabled === undefined) user.rpgEnabled = true
            if (!user.registeredAt) user.registeredAt = new Date().toISOString()
            dataService.saveUser(user)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ✅ *REGISTRO CONCLUÍDO* ✅   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `╭━〔 👤 SEU PERFIL 〕━⬣\n`
            doc += `┃ 🏷️ *Nick:* ${nick}\n`
            doc += `┃ ⚔️ *RPG:* ${user.rpgEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n`
            doc += `┃ 📊 *Nível:* ${user.level || 1} | ⭐ *XP:* ${user.xp || 0}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `💡 *Ajustes:*\n`
            doc += `• \`${prefix}login rpg off\` — sair do RPG\n`
            doc += `• \`${prefix}login nome <novo>\` — trocar o nick\n`
            doc += `• \`${prefix}dossie\` — ver seu perfil completo\n`
            doc += `👑 *${botName}*`
            return reply(jaEra ? doc.trim() : doc.trim(), [sender])
        }

        // Sem args: painel de status / instruções
        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🔐 *LOGIN NO ${botName.slice(0, 10)}* 🔐   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        if (user.registered) {
            doc += `✅ *Você já está registrado!*\n\n`
            doc += `╭━〔 👤 SEU PERFIL 〕━⬣\n`
            doc += `┃ 🏷️ *Nick:* ${user.displayNick || '(não definido)'}\n`
            doc += `┃ ⚔️ *RPG:* ${user.rpgEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n`
            doc += `┃ 📊 *Nível:* ${user.level || 1} | ⭐ *XP:* ${user.xp || 0}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `💡 Troque o nick com \`${prefix}login nome <novo>\` ou o RPG com \`${prefix}login rpg on/off\`.`
        } else {
            doc += `👋 *Bem-vindo!* Para usar o bot, faça seu registro:\n\n`
            doc += `╭━〔 📝 COMO REGISTRAR 〕━⬣\n`
            doc += `┃ 1️⃣ \`${prefix}login <seu nick>\` — como quer ser chamado\n`
            doc += `┃ 2️⃣ \`${prefix}login rpg on\` ou \`off\` — quer jogar RPG?\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `💡 *Ex.:* \`${prefix}login Dragão Slayer\`\n`
            doc += `👑 *${botName}*`
        }
        return reply(doc.trim(), [sender])
    }
}
