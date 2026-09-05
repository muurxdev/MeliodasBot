/**
 * Comando .numfake — Sistema Inteligente de Telefonia Virtual e Ativação de SMS WhatsApp
 * 
 * Funcionalidades:
 * - Seleção inteligente de DDD (Brasil 11 a 99 ou Internacional EUA/Canadá)
 * - Geração procedural de celulares válidos com nono dígito Anatel / FCC
 * - Donos do bot: Ilimitado e 100% Grátis
 * - Usuários comuns: Cobrança em créditos com estorno automático no cancelamento
 * - Monitoramento de status com contagem regressiva e simulação/entrega de código SMS
 */

const virtualNumberService = require('../../services/virtualNumberService')
const creditsService = require('../../services/payments/creditsService')

module.exports = {
    name: 'numfake',
    aliases: ['fakephone', 'numerofake', 'smsfake', 'virtualnumber', 'gerarnumero'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Gera números virtuais com escolha de DDD e recebe SMS para WhatsApp',
    cooldownMs: 2000,
    execute: async ({ sender, info, args, reply, isOwner, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase()
        const param = args.slice(1).join(' ').trim()

        // ═══════════════════════════════════════════════════════════════════
        // 1. SUBCOMANDO: LISTA DE DDDS (.numfake ddds)
        // ═══════════════════════════════════════════════════════════════════
        if (['ddds', 'ddd', 'regioes', 'regiao', 'lista'].includes(sub)) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🌐 *CATÁLOGO DE DDDS MELIODAS* 🌐   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `Escolha qualquer DDD do Brasil ou exterior para gerar seu número:\n\n`
            doc += `🇧🇷 *BRASIL (Sudeste):*\n`
            doc += `• *11* a *19* — São Paulo (Capital, Campinas, Santos, etc)\n`
            doc += `• *21*, *22*, *24* — Rio de Janeiro (Capital, Região dos Lagos)\n`
            doc += `• *27*, *28* — Espírito Santo (Vitória, Cachoeiro)\n`
            doc += `• *31* a *38* — Minas Gerais (BH, Triângulo, Uberlândia)\n\n`
            doc += `🇧🇷 *BRASIL (Sul):*\n`
            doc += `• *41* a *46* — Paraná (Curitiba, Londrina, Maringá)\n`
            doc += `• *47* a *49* — Santa Catarina (Florianópolis, Joinville)\n`
            doc += `• *51* a *55* — Rio Grande do Sul (Porto Alegre, Caxias)\n\n`
            doc += `🇧🇷 *BRASIL (Centro-Oeste & Norte):*\n`
            doc += `• *61* — Brasília / DF\n`
            doc += `• *62*, *64* — Goiás (Goiânia, Rio Verde)\n`
            doc += `• *65*, *66* — Mato Grosso (Cuiabá, Rondonópolis)\n`
            doc += `• *67* — Mato Grosso do Sul (Campo Grande)\n`
            doc += `• *68*, *69*, *63*, *91*-*97* — Acre, RO, TO, Pará, AM, RR, AP\n\n`
            doc += `🇧🇷 *BRASIL (Nordeste):*\n`
            doc += `• *71*, *73*-*77* — Bahia (Salvador, Ilhéus, Feira)\n`
            doc += `• *79* — Sergipe | *81*, *87* — Pernambuco (Recife)\n`
            doc += `• *82* — Alagoas | *83* — Paraíba | *84* — Rio G. do Norte\n`
            doc += `• *85*, *88* — Ceará (Fortaleza) | *86*, *89* — Piauí\n`
            doc += `• *98*, *99* — Maranhão (São Luís, Imperatriz)\n\n`
            doc += `🇺🇸 *INTERNACIONAL (Estados Unidos):*\n`
            doc += `• *212* — Nova York (Manhattan)\n`
            doc += `• *305* — Miami / Flórida\n`
            doc += `• *310* — Los Angeles / Beverly Hills (Califórnia)\n`
            doc += `• *415* — San Francisco / Vale do Silício\n`
            doc += `• *702* — Las Vegas (Nevada)\n`
            doc += `• *407* — Orlando (Flórida)\n\n`
            doc += `💡 *Exemplo de Uso:*\n`
            doc += `👉 \`${prefix}numfake gerar 11\` (São Paulo)\n`
            doc += `👉 \`${prefix}numfake gerar 21\` (Rio de Janeiro)\n`
            doc += `👉 \`${prefix}numfake gerar 305\` (Miami EUA)`

            return reply(doc.trim())
        }

        // ═══════════════════════════════════════════════════════════════════
        // 2. SUBCOMANDO: GERAR NÚMERO (.numfake gerar [ddd])
        // ═══════════════════════════════════════════════════════════════════
        if (['gerar', 'g', 'novo', 'criar', 'pedir'].includes(sub)) {
            const dddInput = param || '11' // Padrão DDD 11 se não informar

            const result = await virtualNumberService.requestVirtualNumber({
                sender,
                dddInput,
                isOwner
            })

            if (!result.success) {
                return reply(result.message)
            }

            const { order, resolved, numberFormatted, numberRaw, expiresInMinutes } = result

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📱 *NÚMERO VIRTUAL GERADO* 📱   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `✅ *Ativação Iniciada com Sucesso!*\n\n`
            doc += `╭━〔 📞 *DADOS DO NÚMERO* 〕━⬣\n`
            doc += `┃ 🔢 *Número:* \`${numberFormatted}\`\n`
            doc += `┃ 📋 *Puro p/ Copiar:* \`${numberRaw}\`\n`
            doc += `┃ 📍 *Região:* ${resolved.regionName}\n`
            doc += `┃ 🌐 *País:* ${resolved.countryName} (+${resolved.ddi})\n`
            doc += `┃ 🏷️ *Serviço:* WhatsApp (WA)\n`
            doc += `┃ ⏱️ *Expira em:* ${expiresInMinutes} minutos\n`
            doc += `┃ 💰 *Custo:* ${isOwner ? '👑 *Grátis (Dono)*' : `*${order.cost_credits} Créditos*`}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `📌 *PASSO A PASSO PARA ATIVAR:*\n`
            doc += `1️⃣ Abra seu *WhatsApp* (ou WhatsApp Business).\n`
            doc += `2️⃣ Cole o número: \`${numberRaw}\`.\n`
            doc += `3️⃣ Solicite o envio do código por *SMS*.\n`
            doc += `4️⃣ Volte aqui e digite: \`${prefix}numfake status\`\n\n`
            doc += `💡 _Caso o SMS demore ou queira outro DDD, você pode cancelar a qualquer momento com:_ \`${prefix}numfake cancelar\` _(estorno 100% garantido)._`

            return reply(doc.trim())
        }

        // ═══════════════════════════════════════════════════════════════════
        // 3. SUBCOMANDO: STATUS / CONSULTAR SMS (.numfake status)
        // ═══════════════════════════════════════════════════════════════════
        if (['status', 's', 'codigo', 'sms', 'ver'].includes(sub)) {
            const statusInfo = virtualNumberService.checkVirtualNumberStatus(sender)

            if (!statusInfo.hasActive) {
                const last = statusInfo.lastOrder
                let msg = `⚠️ *Nenhuma ativação ativa no momento.*\n\n`
                if (last) {
                    msg += `Último número solicitado: *${last.phone_number}* (Status: _${last.status}_)\n\n`
                }
                msg += `👉 Digite \`${prefix}numfake gerar <ddd>\` para gerar um novo número!\n`
                msg += `👉 Digite \`${prefix}numfake ddds\` para consultar os DDDs.`
                return reply(msg.trim())
            }

            const { order, timeLeftFormatted, isExpired } = statusInfo

            if (isExpired) {
                return reply(
                    `⏱️ *TEMPO ESGOTADO!*\n\n` +
                    `O tempo limite de 15 minutos para o número *${order.phone_number}* expirou.\n` +
                    `Você pode cancelar para reaver seus créditos usando: \`${prefix}numfake cancelar\`.`
                )
            }

            if (order.status === 'RECEIVED' && order.sms_code) {
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   📬 *CÓDIGO SMS RECEBIDO!* 📬   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `🎉 Seu código de verificação do WhatsApp chegou:\n\n`
                doc += `╭━〔 🔑 *CÓDIGO DE ATIVAÇÃO* 〕━⬣\n`
                doc += `┃ \n`
                doc += `┃      👉   *${order.sms_code}*   👈\n`
                doc += `┃ \n`
                doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`
                doc += `📱 *Número:* ${order.phone_number}\n`
                doc += `📍 *Região:* ${order.region_name}\n\n`
                doc += `⚡ Copie o código acima e cole no WhatsApp para finalizar a ativação!`
                return reply(doc.trim())
            }

            // Status PENDING
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ⏳ *AGUARDANDO SMS...* ⏳   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📱 *Número:* \`${order.phone_number}\`\n`
            doc += `📍 *Região:* ${order.region_name}\n`
            doc += `⏱️ *Tempo Restante:* ${timeLeftFormatted}\n`
            doc += `⚡ *Status:* Aguardando envio do SMS pela Meta/WhatsApp...\n\n`
            doc += `💡 Assim que solicitar o código no aplicativo, consulte novamente com:\n`
            doc += `👉 \`${prefix}numfake status\``

            return reply(doc.trim())
        }

        // ═══════════════════════════════════════════════════════════════════
        // 4. SUBCOMANDO: CANCELAR E ESTORNAR (.numfake cancelar)
        // ═══════════════════════════════════════════════════════════════════
        if (['cancelar', 'cancel', 'estornar', 'desistir'].includes(sub)) {
            const cancelRes = await virtualNumberService.cancelVirtualNumber({ sender, isOwner })

            if (!cancelRes.success) {
                return reply(cancelRes.message)
            }

            let doc = `✅ *ATIVAÇÃO CANCELADA COM SUCESSO!*\n\n`
            doc += `📱 Número: *${cancelRes.order.phone_number}*\n`
            if (!isOwner && cancelRes.refundedCredits > 0) {
                doc += `💰 *Estorno:* +${cancelRes.refundedCredits} créditos devolvidos à sua carteira!\n`
                const novoSaldo = creditsService.saldo(sender)
                doc += `💳 *Seu Saldo Atual:* ${novoSaldo} créditos\n\n`
            } else {
                doc += `👑 *Dono do Bot:* Nenhum crédito descontado.\n\n`
            }
            doc += `_Você já pode gerar um novo número quando quiser com_ \`${prefix}numfake gerar <ddd>\`.`

            return reply(doc.trim())
        }

        // ═══════════════════════════════════════════════════════════════════
        // 5. SUBCOMANDO: SIMULAR SMS (.numfake simularsms [código])
        // ═══════════════════════════════════════════════════════════════════
        if (['simularsms', 'simular', 'testarsms', 'injetsms'].includes(sub)) {
            const statusInfo = virtualNumberService.checkVirtualNumberStatus(sender)
            if (!statusInfo.hasActive) {
                return reply(`❌ Você não possui nenhum número ativo para simular SMS. Gere um primeiro com \`${prefix}numfake gerar 11\`.`)
            }

            const codeArg = param || `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`
            const delivered = virtualNumberService.deliverSmsCode(statusInfo.order.activation_id, codeArg)

            if (!delivered) {
                return reply(`❌ Não foi possível entregar o SMS (número pode não estar pendente).`)
            }

            return reply(
                `📨 *SMS SIMULADO ENTREGUE!*\n\n` +
                `📱 Número: *${statusInfo.order.phone_number}*\n` +
                `🔑 Código WhatsApp: *${codeArg}*\n\n` +
                `👉 Digite \`${prefix}numfake status\` para visualizar o painel de entrega.`
            )
        }

        // ═══════════════════════════════════════════════════════════════════
        // 6. DASHBOARD PRINCIPAL (.numfake)
        // ═══════════════════════════════════════════════════════════════════
        const saldoAtual = creditsService.saldo(sender)
        const statusInfo = virtualNumberService.checkVirtualNumberStatus(sender)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🤖 *MELIODAS VIRTUAL NUMBERS* 🤖   ║\n`
        doc += `║       _WhatsApp SMS Activator_       ║\n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `Olá! Este serviço gera números de telefone virtuais inteligentes para ativação de contas no WhatsApp com recepção de SMS.\n\n`

        doc += `╭━〔 👤 *SUA CONTA* 〕━⬣\n`
        if (isOwner) {
            doc += `┃ 👑 *Privilégio:* Dono do Bot (ILIMITADO & GRÁTIS)\n`
            doc += `┃ 💰 *Custo por Número:* 0 Créditos\n`
        } else {
            doc += `┃ 👤 *Tipo:* Usuário Comum\n`
            doc += `┃ 💰 *Seu Saldo:* ${saldoAtual} Créditos\n`
            doc += `┃ 🏷️ *Custo por Número:* 5 Créditos\n`
        }
        if (statusInfo.hasActive) {
            doc += `┃ 📱 *Número Ativo:* \`${statusInfo.order.phone_number}\`\n`
            doc += `┃ ⏱️ *Tempo Restante:* ${statusInfo.timeLeftFormatted}\n`
            doc += `┃ ⚡ *Status:* ${statusInfo.order.status === 'RECEIVED' ? '✅ SMS Recebido' : '⏳ Aguardando'}\n`
        } else {
            doc += `┃ 📱 *Número Ativo:* Nenhum no momento\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `⚡ *COMANDOS RÁPIDOS:*\n`
        doc += `👉 \`${prefix}numfake gerar <ddd>\` — Gera número no DDD escolhido (ex: \`${prefix}numfake gerar 11\` ou \`${prefix}numfake gerar 21\`)\n`
        doc += `👉 \`${prefix}numfake ddds\` — Ver catálogo completo de DDDs do Brasil e EUA\n`
        doc += `👉 \`${prefix}numfake status\` — Consultar SMS recebido / código WhatsApp\n`
        doc += `👉 \`${prefix}numfake cancelar\` — Cancelar ativação ativa (com estorno imediato)\n`
        if (isOwner) {
            doc += `👉 \`${prefix}numfake simularsms [código]\` — Simular SMS no número ativo\n`
        }
        if (!isOwner) {
            doc += `\n💳 _Precisa de créditos? Use_ \`${prefix}comprarcreditos\` _para recarregar via PIX!_`
        }

        return reply(doc.trim())
    }
}
