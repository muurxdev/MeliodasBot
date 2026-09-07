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
const rentalPackages = require('../../services/payments/rentalPackagesService')
const rentalService = require('../../services/rentalService')
const { notifyDonos } = require('../../services/ownerService')
const logger = require('../../core/logger')

const reais = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

module.exports = {
    name: 'assinar',
    aliases: ['comprarcreditos', 'planos', 'alugarbot'],
    aliases: ['checkout', 'pagar', 'comprar', 'comprarcreditos', 'planos', 'alugarbot'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Gera o link de pagamento para alugar o bot (cartão ou Pix)',
    cooldownMs: 10000,
    execute: async ({ sender, args, reply }) => {
    description: 'Gera o link de pagamento para alugar o bot (cartão ou Pix) e notifica os Donos',
    cooldownMs: 5000,
    execute: async ({ sender, from, isGroup, args, reply, client, info, quotedSender, isOwner, userRole }) => {
        if (!stripe.isConfigured()) {
            return reply(
                '💳 *PAGAMENTO INDISPONÍVEL*\n\n' +
                'O Stripe ainda não foi configurado neste bot.\n\n' +
                '_O dono precisa rodar_ `node scripts/stripe-setup.js`_._'
                '_O dono precisa configurar as chaves da Stripe no .env._'
            )
        }

        const pacotes = rentalPackages.getPacotes()
        const escolha = (args[0] || '').toLowerCase()
        const pacote = rentalPackages.getPacote(escolha)

        if (!pacote) {
            let doc = '💳 *PLANOS DE ASSINATURA & ALUGUEL*\n\n'

            doc += '╭━〔 🏢 ALUGUEL DE GRUPO 〕━⬣\n'
            for (const p of pacotes.filter(x => x.escopo === 'Grupo')) {
                const cr = creditos.centavosParaCreditos(p.centavos)
                doc += `┃ \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos / ${p.dias}d)_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '╭━〔 👤 ALUGUEL DE PV (PRIVADO) 〕━⬣\n'
            for (const p of pacotes.filter(x => x.escopo === 'PV')) {
                const cr = creditos.centavosParaCreditos(p.centavos)
                doc += `┃ \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos / ${p.dias}d)_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '╭━〔 👑 COMBO (GRUPO + PV) 〕━⬣\n'
            for (const p of pacotes.filter(x => x.escopo === 'Combo')) {
                const cr = creditos.centavosParaCreditos(p.centavos)
                doc += `┃ \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos / ${p.dias}d)_\n`
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'

            doc += '📌 *Para assinar:* `.assinar <código>`\n'
            doc += '_Exemplo:_ `.assinar g2` (Grupo Mensal)\n'
            doc += '_Exemplo:_ `.assinar pv2` (PV Mensal)\n'
            doc += '_Exemplo:_ `.assinar c1` (Combo Mensal)\n\n'
            doc += '📌 *Para gerar o checkout:* `.checkout <código>` ou `.assinar <código>`\n'
            doc += '_Exemplo:_ `.checkout g2` (Grupo Mensal)\n'
            doc += '_Exemplo:_ `.checkout pv2` (PV Mensal)\n'
            doc += '_Exemplo:_ `.checkout c1` (Combo Mensal)\n\n'
            doc += '💰 _Seus créditos atuais:_ ' + creditos.saldo(sender) + '\n'
            doc += '🎁 _Teste Grátis 2h:_ `.aluguel teste`\n'
            if (stripe.modo() === 'teste') {
                doc += '\n⚠️ *MODO DE TESTE* — nenhuma cobrança real será feita.'
            }
            return reply(doc)
        }

        // Determinar beneficiário: por padrão quem solicitou ou alvo fornecido
        let targetJid = sender
        let targetName = sender.split('@')[0]
        const rawTarget = args[1]
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const targetInput = mentioned || quotedSender || rawTarget

        if (targetInput) {
            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (resolved) {
                targetJid = resolved.jid
                targetName = resolved.name
            }
        }

        await reply('⏳ *Gerando seu link de pagamento...*')

        try {
            const sessao = await stripe.criarCheckout({
                valorCentavos: pacote.centavos,
                descricao: `Aluguel do bot — plano ${pacote.nome}`,
                // O jid é o que liga o pagamento à pessoa no WhatsApp.
                metadata: { jid: sender, pacote: pacote.id, dias: String(pacote.dias) }
                descricao: `Aluguel MeliodasBot — plano ${pacote.nome} (${targetName})`,
                metadata: {
                    jid: targetJid,
                    requestedBy: sender,
                    pacote: pacote.id,
                    dias: String(pacote.dias),
                    beneficiaryName: targetName
                }
            })

            logger.info(`[ASSINAR] Checkout ${sessao.id} criado para ${sender} (${pacote.nome})`)
            logger.info(`[ASSINAR/CHECKOUT] Checkout ${sessao.id} criado para ${targetJid} via ${sender} (${pacote.nome})`)

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
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   💳 *LINK DE PAGAMENTO / CHECKOUT*   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📦 *Plano:* *${pacote.nome}*\n`
            doc += `🏢 *Modalidade:* *${pacote.escopo}*\n`
            doc += `⏱️ *Duração:* *${pacote.dias} dias*\n`
            doc += `💵 *Valor:* *${reais(pacote.centavos)}*\n`
            doc += `🎟️ *Créditos Inclusos:* ${cr} créditos\n`
            doc += `👤 *Beneficiário:* @${targetJid.split('@')[0]}\n`
            doc += `💳 *Formas:* ${sessao.metodos.join(' / ')}\n\n`
            doc += `🔗 *Acesse para Pagar:*\n👉 ${sessao.url}\n\n`
            doc += '⏳ _O link é seguro, oficial e expira em 24h._\n'
            doc += '⚡ _Assim que confirmado (Pix ou Cartão), o bot libera o acesso automaticamente!_'

            if (stripe.modo() === 'teste') {
                doc += '\n\n⚠️ *MODO DE TESTE* — use o cartão 4242 4242 4242 4242.'
            }

            return reply(doc)
            // Envia resposta no chat atual
            await reply(doc.trim(), [targetJid])

            // Notifica os Donos do bot via WhatsApp
            let donoDoc = '╔══════════════════════════════╗\n'
            donoDoc += '║   🔔 *NOVA REQUISIÇÃO DE CHECKOUT*   ║\n'
            donoDoc += '╚══════════════════════════════╝\n\n'
            donoDoc += `👤 *Solicitante:* @${sender.split('@')[0]}\n`
            donoDoc += `🎯 *Destinatário:* @${targetJid.split('@')[0]} (${targetName})\n`
            donoDoc += `📦 *Plano:* ${pacote.nome} (\`${pacote.id}\`)\n`
            donoDoc += `💰 *Valor:* ${reais(pacote.centavos)} (${pacote.dias} dias)\n`
            donoDoc += `🔗 *Checkout URL:*\n${sessao.url}\n\n`
            donoDoc += `💳 *Formas:* ${sessao.metodos.join(', ')}\n`
            donoDoc += `📅 *Horário:* ${new Date().toLocaleString('pt-BR')}`

            await notifyDonos(client, donoDoc.trim(), { mentions: [sender, targetJid] })

            // Se o alvo for outro usuário no privado, encaminha o link para ele diretamente também
            if (targetJid !== sender && targetJid.endsWith('@s.whatsapp.net')) {
                try {
                    await client.sendMessage(targetJid, { text: doc.trim(), mentions: [targetJid] })
                } catch (_) {}
            }
        } catch (e) {
            logger.error(`[ASSINAR] Falha ao criar checkout para ${sender}: ${e.message}`)
            logger.error(`[ASSINAR/CHECKOUT ERROR] Falha ao criar checkout: ${e.message}`)
            return reply(
                `❌ *Não consegui gerar o link.*\n\n_${e.message}_\n\n` +
                '_Se persistir, avise o dono do bot._'
            )
        }
    }
}
