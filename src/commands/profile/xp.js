const dataService = require('../../services/dataService')
const { getXpProgress, getXpTips } = require('../../services/xpService')
const { getCargo, getRank } = require('../../utils/helpers')

module.exports = {
    name: 'xp',
    aliases: ['level', 'nivel', 'meuxp'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Exibe seu nível, XP, progresso para o próximo nível e como ganhar mais',
    cooldownMs: 2000,
    execute: async ({ info, sender, reply, prefix = '.' }) => {
        const alvo = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const perfil = dataService.getUser(alvo) || dataService.initializeUser(alvo, {})
        const prog = getXpProgress(perfil)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ⭐ *PROGRESSO DE XP* ⭐   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `👤 @${alvo.split('@')[0]}\n`
        doc += `📈 *Nível:* ${perfil.level || 1} | 🏆 *Rank:* ${getRank(perfil.level || 1)}\n`
        doc += `💼 *Cargo:* ${getCargo(perfil.level || 1)}\n`
        doc += `⚡ *Poder:* ${prog.poder} | ❤️ *HP:* ${perfil.hpMax || 100}\n\n`

        doc += `╭━〔 📊 RUMO AO NÍVEL ${(perfil.level || 1) + 1} 〕━⬣\n`
        doc += `┃ ${prog.barra} ${prog.percent}%\n`
        doc += `┃ ⭐ *XP:* ${prog.atual.toLocaleString('pt-BR')} / ${prog.necessario.toLocaleString('pt-BR')}\n`
        doc += `┃ 🎯 *Faltam:* ${prog.faltam.toLocaleString('pt-BR')} XP\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🗂️ SEU XP POR ORIGEM 〕━⬣\n`
        doc += `┃ 👥 *XP Grupo:* ${(perfil.xpGroup || 0).toLocaleString('pt-BR')}\n`
        doc += `┃ 📱 *XP Privado:* ${(perfil.xpPv || 0).toLocaleString('pt-BR')}\n`
        doc += `┃ 📅 *XP Semanal:* ${(perfil.weeklyXp || 0).toLocaleString('pt-BR')}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🚀 COMO GANHAR MAIS XP 〕━⬣\n`
        for (const tip of getXpTips(prefix)) doc += `┃ ${tip}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `💡 _Veja seu perfil completo com_ \`${prefix}dossie\``

        await reply(doc.trim(), [alvo])
    }
}
