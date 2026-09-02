const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { barraXP, getCargo, getRank } = require('../../utils/helpers')

module.exports = {
    name: 'xp',
    aliases: ['perfil', 'level'],
    category: 'profile',
    description: 'Exibe seu nível, XP, rank e progresso no bot',
    execute: async ({ info, sender, reply }) => {
        const xpData = dataService.getXpData()
        const alvo = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const perfil = initializeUser(alvo, xpData)

        const cargo = perfil.equipado ? ('🎒 ' + perfil.equipado) : getCargo(perfil.level)
        const rank = getRank(perfil.level)
        const maxXp = Math.floor(100 * Math.pow(perfil.level, 1.5))

        const texto = '🏆 *PERFIL DO USUÁRIO*\n\n👤 @' + alvo.split('@')[0] + '\n\n⭐ *XP:* ' + perfil.xp + ' / ' + maxXp + '\n📊 *Progresso:* ' + barraXP(perfil.xp, perfil.level) + '\n\n📈 *Nível:* ' + perfil.level + '\n🏆 *Rank:* ' + rank + '\n💼 *Cargo:* ' + cargo + '\n🧬 *Classe:* ' + (perfil.classe || 'Nenhuma') + '\n🔮 *Classe Lendária:* ' + (perfil.classeLendaria || 'Nenhuma') + '\n🐛 *Poder Bug:* ' + (perfil.bugPower || 0) + '\n━━━━━━━━━━━━━━━━━━\n💰 *Coins:* ' + perfil.coins + '\n💬 *Mensagens:* ' + (perfil.messages || 0) + '\n❤️ *Rep:* ' + (perfil.rep || 0) + '\n🔥 *Streak:* ' + (perfil.streak || 0) + '\n🥇 *Conquistas:* ' + (perfil.conquistas?.length || 0) + '\n🐉 *Bosses derrotados:* ' + (perfil.bossesMortos || 0) + '\n🏆 *Vitórias:* ' + (perfil.wins || 0) + ' | 💀 *Derrotas:* ' + (perfil.losses || 0)

        await reply(texto, [alvo])
    }
}