/**
 * Comando .bosses — lista os chefes que o jogador já derrotou.
 *
 * O perfil mostrava só um contador ("37 bosses"), sem dizer quais. Aqui vem a
 * lista completa: quantas vezes cada chefe caiu e quando foi a última vez.
 */

const economy = require('../../services/economyService')
const bossHistory = require('../../services/bossHistoryService')

module.exports = {
    name: 'bosses',
    aliases: ['meusbosses', 'chefes', 'bossderrotados'],
    category: 'rpg',
    subcategory: 'Perfil',
    description: 'Lista os bosses que você já derrotou',
    cooldownMs: 3000,
    execute: async ({ sender, info, args, reply }) => {
        // Permite consultar o histórico de outra pessoa marcando ela.
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const alvo = mencionado || sender
        const user = economy.carregarUsuario(alvo)

        const total = Number(user.bossesMortos || 0)
        const lista = bossHistory.resumoOrdenado(user)

        if (!lista.length) {
            // Um veterano de antes deste recurso tem contador mas não tem
            // histórico — dizer "nunca derrotou" seria mentira.
            if (total > 0) {
                return reply(
                    `💀 *BOSSES DERROTADOS*\n\n` +
                    `🏆 *Total:* ${total.toLocaleString('pt-BR')} chefe(s)\n\n` +
                    `_O detalhamento por chefe começou a ser registrado agora._\n` +
                    `_Os próximos abates aparecem aqui com nome e data._`
                )
            }
            return reply(
                '💀 *BOSSES DERROTADOS*\n\n' +
                'Você ainda não derrotou nenhum chefe.\n\n' +
                '💡 _Use_ `.boss` _ou_ `.raid` _para enfrentar um._'
            )
        }

        const nomeAlvo = mencionado ? `@${alvo.split('@')[0]}` : 'Você'

        let doc = '╔══════════════════════════════╗\n'
        doc += '║   💀 *BOSSES DERROTADOS* 💀   ║\n'
        doc += '╚══════════════════════════════╝\n\n'
        doc += `👤 *${nomeAlvo}*\n`
        doc += `🏆 *Total de abates:* ${total.toLocaleString('pt-BR')}\n`
        doc += `🎯 *Chefes diferentes:* ${lista.length}\n\n`

        doc += '╭━〔 📜 POR CHEFE 〕━⬣\n'
        for (const b of lista) {
            doc += `┃ ${bossHistory.emojiDe(b.raridade)} *${b.nome}*\n`
            doc += `┃    ${b.vezes}x _(último ${bossHistory.dataRelativa(b.ultimo)})_\n`
        }
        doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'

        const recentes = bossHistory.historicoRecente(user, 5)
        if (recentes.length) {
            doc += '\n╭━〔 ⏱️ ÚLTIMOS ABATES 〕━⬣\n'
            for (const r of recentes) {
                const marca = r.tipo === 'raid' ? '⚔️' : '💀'
                doc += `┃ ${marca} ${r.nome} — _${bossHistory.dataRelativa(r.em)}_\n`
                if (r.dano) doc += `┃    dano: ${r.dano.toLocaleString('pt-BR')}\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣'
        }

        return reply(doc, mencionado ? [alvo] : [])
    }
}
