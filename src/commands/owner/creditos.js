/**
 * Comando .creditos — carteira de créditos do aluguel (dinheiro real).
 *
 * Não confundir com as moedas do RPG: crédito aqui foi pago de verdade. Por
 * isso vive em outra estrutura e nenhum comando de cassino ou `.roubar`
 * consegue encostar nele.
 *
 * `.creditos`             — seu saldo e extrato
 * `.creditos ajustar @x N` — (dono) estorno, cortesia ou correção
 * `.creditos todos`        — (dono) lista quem tem saldo
 */

const creditos = require('../../services/payments/creditsService')

function dataCurta(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    })
}

const reais = c => (Number(c) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

module.exports = {
    name: 'creditos',
    aliases: ['meuscreditos', 'carteiraaluguel', 'saldocreditos'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Mostra seus créditos de aluguel e o extrato',
    cooldownMs: 3000,
    execute: async ({ sender, info, args, reply, isOwner }) => {
        const acao = (args[0] || '').toLowerCase()
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

        // ── Ajuste manual (só o dono): estorno, cortesia, correção.
        if (acao === 'ajustar') {
            if (!isOwner) return reply('❌ *Só o dono do bot pode ajustar créditos.*')
            const valor = parseInt(args.find(a => /^-?\d+$/.test(a)), 10)
            if (!mencionado || !Number.isInteger(valor)) {
                return reply(
                    '📌 *Uso:* `.creditos ajustar @pessoa <quantidade>`\n\n' +
                    '_Use número negativo para retirar._\n' +
                    '_Exemplo:_ `.creditos ajustar @fulano -50`'
                )
            }
            const r = creditos.ajustar({ jid: mencionado, creditos: valor, motivo: `ajuste por ${sender}` })
            return reply(
                `✅ *CRÉDITOS AJUSTADOS*\n\n` +
                `👤 @${mencionado.split('@')[0]}\n` +
                `${valor >= 0 ? '➕' : '➖'} *${Math.abs(valor)}* créditos\n` +
                `💰 *Novo saldo:* ${r.saldo}`,
                [mencionado]
            )
        }

        // ── Panorama de todos (só o dono).
        if (acao === 'todos' || acao === 'listar') {
            if (!isOwner) return reply('❌ *Só o dono do bot pode ver a lista completa.*')
            const perfis = creditos.todosOsPerfis().filter(p => p.creditos > 0 || p.totalPago > 0)
            if (!perfis.length) return reply('📭 *Ninguém tem créditos ainda.*')

            let doc = '💳 *CARTEIRAS DE ALUGUEL*\n\n'
            let totalPago = 0
            for (const p of perfis.slice(0, 25)) {
                totalPago += Number(p.totalPago || 0)
                doc += `👤 @${p.jid.split('@')[0]}\n`
                doc += `   🎟️ ${p.creditos} créditos • 💵 ${reais(p.totalPago || 0)} pagos\n`
            }
            if (perfis.length > 25) doc += `\n_...e mais ${perfis.length - 25}._\n`
            doc += `\n📊 *Total arrecadado:* ${reais(totalPago)}`
            return reply(doc, perfis.slice(0, 25).map(p => p.jid))
        }

        // ── Saldo próprio (ou de alguém, se o dono marcar).
        const alvo = (isOwner && mencionado) ? mencionado : sender
        const p = creditos.perfil(alvo)
        const dias = creditos.creditosParaDias(p.creditos)

        let doc = '💳 *CARTEIRA DE ALUGUEL*\n\n'
        if (alvo !== sender) doc += `👤 @${alvo.split('@')[0]}\n\n`
        doc += `🎟️ *Créditos:* ${p.creditos}\n`
        doc += `📅 *Equivale a:* ${dias} dia(s) de aluguel\n`

        if (p.totalPago > 0) {
            doc += `💵 *Total pago:* ${reais(p.totalPago)}\n`
            doc += `🗓️ *Última compra:* ${dataCurta(p.ultimaCompra)}\n`
        }

        const ext = creditos.extrato(alvo, 5)
        if (ext.length) {
            doc += '\n╭━〔 📜 ÚLTIMOS MOVIMENTOS 〕━⬣\n'
            for (const m of ext) {
                const sinal = m.creditos >= 0 ? '+' : ''
                const rotulo = m.tipo === 'compra' ? '💵 Compra'
                    : m.tipo === 'gasto' ? '🔄 ' + (m.motivo || 'uso')
                        : '🛠️ ' + (m.motivo || 'ajuste')
                doc += `┃ ${rotulo}: ${sinal}${m.creditos}\n`
                doc += `┃    _${dataCurta(m.em)}_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
        }

        doc += '\n💡 _Comprar:_ `.assinar` _• Usar:_ `.reativar`'
        return reply(doc, alvo !== sender ? [alvo] : [])
    }
}
