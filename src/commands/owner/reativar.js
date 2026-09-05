/**
 * Comando .reativar — troca créditos por dias de aluguel do grupo.
 *
 * A ordem importa: só gastamos o crédito DEPOIS que o aluguel foi estendido
 * com sucesso. Se debitássemos antes e o addRentalTime falhasse, o crédito
 * pago com dinheiro real sumiria sem nada em troca. Se ainda assim a extensão
 * falhar após o débito, estornamos.
 */

const creditos = require('../../services/payments/creditsService')
const rentalService = require('../../services/rentalService')
const logger = require('../../core/logger')

module.exports = {
    name: 'reativar',
    aliases: ['renovaraluguel', 'usarcreditos', 'ativaraluguel'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Usa seus créditos para renovar o aluguel do grupo, do PV ou do Combo',
    groupOnly: false,
    cooldownMs: 5000,
    execute: async ({ sender, from, isGroup, args, reply, pushName }) => {
        const saldo = creditos.saldo(sender)
        const custoDia = creditos.CREDITOS_POR_DIA
        const diasDisponiveis = creditos.creditosParaDias(saldo)

        let targetScope = isGroup ? 'group' : 'pv'
        let targetJid = isGroup ? from : sender
        let targetName = isGroup ? 'Grupo Atual' : 'Seu Privado (PV)'

        let daysArg = args[0]
        const first = (args[0] || '').toLowerCase()

        if (['pv', 'dm', 'privado'].includes(first)) {
            targetScope = 'pv'
            targetJid = sender
            targetName = 'Seu Privado (PV)'
            daysArg = args[1]
        } else if (['grupo', 'group'].includes(first)) {
            targetScope = 'group'
            targetJid = isGroup ? from : (args[2] || from)
            targetName = 'Grupo'
            daysArg = args[1]
        } else if (['combo', 'ambos'].includes(first)) {
            targetScope = 'combo'
            daysArg = args[1]
        }

        const pedido = parseInt(daysArg, 10)

        if (!Number.isInteger(pedido) || pedido <= 0) {
            const currentInfo = rentalService.getRentalInfo(targetJid)
            let doc = '🔄 *REATIVAR ALUGUEL COM CRÉDITOS*\n\n'
            doc += `🎟️ *Seus créditos:* ${saldo}\n`
            doc += `💱 *Custo diário:* ${custoDia} créditos por dia\n`
            doc += `📅 *Créditos suficientes para:* ${diasDisponiveis} dia(s)\n\n`

            if (currentInfo?.expiresAt) {
                const restante = currentInfo.expiresAt - Date.now()
                doc += `⏳ *Prazo atual (${targetName}):* ${rentalService.formatTimeRemaining(restante)}\n\n`
            }

            if (diasDisponiveis <= 0) {
                doc += '❌ _Você não tem créditos suficientes no momento._\n'
                doc += '💡 _Digite_ `.assinar` _para comprar créditos online._'
            } else {
                doc += '📌 *Como usar:*\n'
                doc += `• \`.reativar <dias>\` — Renova onde você está (${isGroup ? 'Grupo' : 'PV'})\n`
                doc += `• \`.reativar pv <dias>\` — Renova seu Privado\n`
                doc += `• \`.reativar grupo <dias>\` — Renova o Grupo\n`
                doc += `• \`.reativar combo <dias>\` — Renova Grupo + PV\n\n`
                doc += `_Exemplo:_ \`.reativar ${Math.min(30, diasDisponiveis)}\``
            }
            return reply(doc)
        }

        const custoTotal = targetScope === 'combo' ? (pedido * custoDia * 1.5) : (pedido * custoDia)
        const custoFinal = Math.ceil(custoTotal)

        if (saldo < custoFinal) {
            return reply(
                '❌ *Créditos insuficientes.*\n\n' +
                `📅 Pedido: ${pedido} dia(s) [${targetScope.toUpperCase()}] = ${custoFinal} créditos\n` +
                `🎟️ Seu saldo: ${saldo} créditos _(dá para ${diasDisponiveis} dia(s))_\n\n` +
                '💡 _Digite_ `.assinar` _para recarregar créditos._'
            )
        }

        // 1. Estende primeiro
        try {
            if (targetScope === 'combo') {
                rentalService.addRentalTime(sender, `${pedido}d`, pushName || sender, 'pv')
                if (isGroup) rentalService.addRentalTime(from, `${pedido}d`, pushName || sender, 'group')
            } else {
                rentalService.addRentalTime(targetJid, `${pedido}d`, pushName || sender, targetScope)
            }
        } catch (e) {
            logger.error(`[REATIVAR] Falha ao estender aluguel de ${targetJid}: ${e.message}`)
            return reply(`❌ *Não consegui estender o aluguel.*\n\n_${e.message}_\n\n_Nenhum crédito foi gasto._`)
        }

        // 2. Cobra créditos
        const g = creditos.gastar({
            jid: sender,
            creditos: custoFinal,
            motivo: `aluguel ${targetScope} +${pedido}d em ${targetJid}`
        })

        if (!g.ok) {
            logger.warn(`[REATIVAR] Débito falhou após estender ${targetJid}; revertendo`)
            try {
                rentalService.addRentalTime(targetJid, `-${pedido}d`, 'reversão automática')
            } catch (_) {}
            return reply(`❌ ${g.erro}`)
        }

        const infoAtualizada = rentalService.getRentalInfo(targetJid)
        const expira = infoAtualizada?.expiresAt || 0
        const restante = expira ? expira - Date.now() : 0

        logger.info(`[REATIVAR] ${sender} usou ${custoFinal} créditos para +${pedido}d em ${targetJid} (${targetScope})`)

        return reply(
            '✅ *ALUGUEL RENOVADO COM SUCESSO!*\n\n' +
            `📌 *Modalidade:* *${targetScope.toUpperCase()}*\n` +
            `📅 *Tempo Adicionado:* *+${pedido} dia(s)*\n` +
            `💸 *Créditos Gastos:* *${custoFinal}*\n` +
            `🎟️ *Saldo Restante:* *${g.saldo} créditos*\n\n` +
            `⏳ *Novo Prazo:* ${rentalService.formatTimeRemaining(restante)}\n\n` +
            '_Obrigado por manter o bot ativo!_'
        )
    }
}
