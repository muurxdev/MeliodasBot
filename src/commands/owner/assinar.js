/**
 * Comando .assinar — gera o link de pagamento do aluguel (Stripe).
 *
 * O link é pessoal: o JID de quem pediu vai no `metadata` da sessão. É por ele
 * que o webhook sabe para quem creditar quando o pagamento confirma — sem isso
 * o dinheiro entra e não há como identificar o pagador.
 *
 * Fica em `owner/` por categoria, mas NÃO é ownerOnly: quem aluga o bot precisa
 * conseguir pagar.
 */

const stripe = require('../../services/payments/stripeService')
const creditos = require('../../services/payments/creditsService')
const logger = require('../../core/logger')

// Pacotes oferecidos divididos por escopo.
const PACOTES = [
    // Grupos
    { id: 'g1', escopo: 'Grupo', nome: 'Grupo Semanal', centavos: 1500, dias: 7 },
    { id: 'g2', escopo: 'Grupo', nome: 'Grupo Mensal', centavos: 3500, dias: 30 },
    { id: 'g3', escopo: 'Grupo', nome: 'Grupo Trimestral', centavos: 9000, dias: 90 },
    { id: 'g4', escopo: 'Grupo', nome: 'Grupo Anual', centavos: 28000, dias: 365 },

    // PV (Privado)
    { id: 'pv1', escopo: 'PV', nome: 'PV Semanal', centavos: 1000, dias: 7 },
    { id: 'pv2', escopo: 'PV', nome: 'PV Mensal', centavos: 2000, dias: 30 },
    { id: 'pv3', escopo: 'PV', nome: 'PV Trimestral', centavos: 5000, dias: 90 },
    { id: 'pv4', escopo: 'PV', nome: 'PV Anual', centavos: 15000, dias: 365 },

    // Combo (Grupo + PV)
    { id: 'c1', escopo: 'Combo', nome: 'Combo Mensal (Grupo + PV)', centavos: 4500, dias: 30 },
    { id: 'c2', escopo: 'Combo', nome: 'Combo Trimestral (Grupo + PV)', centavos: 12000, dias: 90 },
    { id: 'c3', escopo: 'Combo', nome: 'Combo Anual (Grupo + PV)', centavos: 35000, dias: 365 }
]

const reais = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

module.exports = {
    name: 'assinar',
    aliases: ['comprarcreditos', 'planos', 'alugarbot'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Gera o link de pagamento para alugar o bot (cartão ou Pix)',
    cooldownMs: 10000,
    execute: async ({ sender, args, reply }) => {
        if (!stripe.isConfigured()) {
            return reply(
                '💳 *PAGAMENTO INDISPONÍVEL*\n\n' +
                'O Stripe ainda não foi configurado neste bot.\n\n' +
                '_O dono precisa rodar_ `node scripts/stripe-setup.js`_._'
            )
        }

        const escolha = (args[0] || '').toLowerCase()
        const pacote = PACOTES.find(p => p.id === escolha || p.nome.toLowerCase() === escolha)

        if (!pacote) {
            let doc = '💳 *PLANOS DE ASSINATURA & ALUGUEL*\n\n'

            doc += '╭━〔 🏢 ALUGUEL DE GRUPO 〕━⬣\n'
            for (const p of PACOTES.filter(x => x.escopo === 'Grupo')) {
                const cr = creditos.centavosParaCreditos(p.centavos)
                doc += `┃ \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos / ${p.dias}d)_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '╭━〔 👤 ALUGUEL DE PV (PRIVADO) 〕━⬣\n'
            for (const p of PACOTES.filter(x => x.escopo === 'PV')) {
                const cr = creditos.centavosParaCreditos(p.centavos)
                doc += `┃ \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos / ${p.dias}d)_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '╭━〔 👑 COMBO (GRUPO + PV) 〕━⬣\n'
            for (const p of PACOTES.filter(x => x.escopo === 'Combo')) {
                const cr = creditos.centavosParaCreditos(p.centavos)
                doc += `┃ \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos / ${p.dias}d)_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '📌 *Para assinar:* `.assinar <código>`\n'
            doc += '_Exemplo:_ `.assinar g2` (Grupo Mensal)\n'
            doc += '_Exemplo:_ `.assinar pv2` (PV Mensal)\n'
            doc += '_Exemplo:_ `.assinar c1` (Combo Mensal)\n\n'
            doc += '💰 _Seus créditos atuais:_ ' + creditos.saldo(sender) + '\n'
            doc += '🎁 _Teste Grátis 2h:_ `.aluguel teste`\n'
            if (stripe.modo() === 'teste') {
                doc += '\n⚠️ *MODO DE TESTE* — nenhuma cobrança real será feita.'
            }
            return reply(doc)
        }

        await reply('⏳ *Gerando seu link de pagamento...*')

        try {
            const sessao = await stripe.criarCheckout({
                valorCentavos: pacote.centavos,
                descricao: `Aluguel do bot — plano ${pacote.nome}`,
                // O jid é o que liga o pagamento à pessoa no WhatsApp.
                metadata: { jid: sender, pacote: pacote.id, dias: String(pacote.dias) }
            })

            logger.info(`[ASSINAR] Checkout ${sessao.id} criado para ${sender} (${pacote.nome})`)

            const cr = creditos.centavosParaCreditos(pacote.centavos)
            let doc = '💳 *LINK DE PAGAMENTO*\n\n'
            doc += `📦 *Plano:* ${pacote.nome}\n`
            doc += `💵 *Valor:* ${reais(pacote.centavos)}\n`
            doc += `🎟️ *Você recebe:* ${cr} créditos\n`
            doc += `💳 *Formas de pagamento:* ${sessao.metodos.join(' ou ')}\n\n`
            doc += `👉 ${sessao.url}\n\n`
            doc += '_O link vale por 24h. Assim que o pagamento confirmar, '
            doc += 'os créditos caem automaticamente e eu te aviso aqui._\n\n'
            doc += '💡 _Depois use_ `.reativar` _para transformar crédito em dias._'
            if (stripe.modo() === 'teste') {
                doc += '\n\n⚠️ *MODO DE TESTE* — use o cartão 4242 4242 4242 4242.'
            }

            return reply(doc)
        } catch (e) {
            logger.error(`[ASSINAR] Falha ao criar checkout para ${sender}: ${e.message}`)
            return reply(
                `❌ *Não consegui gerar o link.*\n\n_${e.message}_\n\n` +
                '_Se persistir, avise o dono do bot._'
            )
        }
    }
}
