/**
 * Comando .numfake — Sistema Inteligente de Telefonia Virtual e Ativação de SMS WhatsApp
 * 
 * Funcionalidades:
 * - Seleção inteligente de DDD (Brasil 11 a 99 ou Internacional EUA/Canadá)
 * - Integração nativa com chips reais GSM (SMS-Activate) para validação autêntica na Meta/WhatsApp
 * - Modo Sandbox Inteligente quando não há chave configurada
 * - Donos do bot: Ilimitado e 100% Grátis
 * - Usuários comuns: Cobrança em créditos com estorno automático no cancelamento
 * - Entrega de código sob demanda (.numfake cod / .numfake status) — sem push prematuro
 * - Configuração de API Key (.numfake setkey <chave>) e consulta de saldo (.numfake saldo)
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
    execute: async ({ client, from, sender, info, args, reply, isOwner, prefix = '.' }) => {
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
            doc += `👉 \`${prefix}numfake gerar +1\` ou \`${prefix}numfake gerar 305\` (EUA / Miami)`

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
                isOwner,
                autoReplace: true
            })

            if (!result.success) {
                return reply(result.message)
            }

            const { order, resolved, numberFormatted, numberRaw, isReal, expiresInMinutes } = result
            const hasApiKey = Boolean(virtualNumberService.getApiKey())

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
            doc += `┃ 📡 *Tipo de Linha:* ${isReal ? '🟢 Chip GSM Real (SMS-Activate)' : '🟡 Modo Simulação (Sandbox)'}\n`
            doc += `┃ ⏱️ *Expira em:* ${expiresInMinutes} minutos\n`
            doc += `┃ 💰 *Custo:* ${isOwner ? '👑 *Grátis (Dono)*' : `*${order.cost_credits} Créditos*`}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `📌 *PASSO A PASSO PARA ATIVAR:*\n`
            doc += `1️⃣ Abra seu *WhatsApp* (ou WhatsApp Business).\n`
            doc += `2️⃣ Cole o número puro: \`${numberRaw}\`.\n`
            doc += `3️⃣ Avance e solicite o código por *SMS* no aplicativo.\n`
            doc += `4️⃣ Assim que solicitar o SMS no WhatsApp, venha aqui e digite:\n`
            doc += `👉 \`${prefix}numfake cod\`  _(ou \`${prefix}numfake status\`)_\n\n`

            if (!hasApiKey) {
                doc += `⚠️ *AVISO IMPORTANTE (Modo Sandbox):*\n`
                doc += `O bot está sem chave de API do SMS-Activate configurada. O WhatsApp oficial exige um chip físico/GSM real para validar a criptografia do SMS.\n`
                if (isOwner) {
                    doc += `👑 *Para o Dono:* Configure chips GSM reais com:\n👉 \`${prefix}numfake setkey <sua_api_key>\`\n\n`
                } else {
                    doc += `💡 Peça ao Dono do bot para configurar a chave com \`${prefix}numfake setkey\` para validação 100% garantida.\n\n`
                }
            }

            doc += `💡 _Para cancelar ou trocar de número a qualquer momento, use \`${prefix}numfake cancelar\` ou gere outro DDD com \`${prefix}numfake gerar <ddd>\`._`

            return reply(doc.trim())
        }

        // ═══════════════════════════════════════════════════════════════════
        // 3. SUBCOMANDO: STATUS / CÓDIGO SMS (.numfake cod ou .numfake status)
        // ═══════════════════════════════════════════════════════════════════
        if (['status', 's', 'codigo', 'cod', 'code', 'sms', 'ver'].includes(sub)) {
            const statusInfo = await virtualNumberService.checkVirtualNumberStatus(sender)

            if (!statusInfo.hasActive) {
                const last = statusInfo.lastOrder
                let msg = `⚠️ *Nenhuma ativação em andamento no momento.*\n\n`
                if (last) {
                    msg += `Último número solicitado: *${last.phone_number}* (Status: _${last.status}_)\n\n`
                }
                msg += `👉 Digite \`${prefix}numfake gerar <ddd>\` para gerar um novo número!\n`
                msg += `👉 Digite \`${prefix}numfake ddds\` para consultar a lista de DDDs.`
                return reply(msg.trim())
            }

            const { order, timeLeftFormatted, isExpired, isReal } = statusInfo

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
                doc += `🎉 *Código de verificação do WhatsApp:* \n\n`
                doc += `╭━〔 🔑 *CÓDIGO DE ATIVAÇÃO* 〕━⬣\n`
                doc += `┃ \n`
                doc += `┃      👉   *${order.sms_code}*   👈\n`
                doc += `┃ \n`
                doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`
                doc += `📱 *Número:* \`${order.phone_number}\`\n`
                doc += `📍 *Região:* ${order.region_name}\n`
                doc += `📡 *Tipo:* ${isReal ? '🟢 Chip Real GSM (SMS-Activate)' : '🟡 Modo Simulação'}\n\n`
                doc += `⚡ Copie o código acima e insira no WhatsApp para concluir!`

                if (!isReal) {
                    doc += `\n\n⚠️ *Nota:* Este código foi gerado no ambiente Sandbox/Simulação. Caso o WhatsApp informe erro de código incorreto, é porque a Meta valida o SMS via modem de operadora. Para ativar contas reais, configure a chave GSM com:\n👉 \`${prefix}numfake setkey <api_key>\``
                }

                return reply(doc.trim())
            }

            // Status PENDING
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ⏳ *AGUARDANDO SMS...* ⏳   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📱 *Número:* \`${order.phone_number}\`\n`
            doc += `📍 *Região:* ${order.region_name}\n`
            doc += `📡 *Modo:* ${isReal ? '🟢 Modem GSM Real' : '🟡 Simulação'}\n`
            doc += `⏱️ *Tempo Restante:* ${timeLeftFormatted}\n`
            doc += `⚡ *Status:* Aguardando operadora / Meta enviar o SMS...\n\n`
            doc += `📌 *O que fazer agora:*\n`
            doc += `1. Peça o envio de SMS no WhatsApp (ou toque em "Reenviar SMS").\n`
            doc += `2. Aguarde alguns instantes e consulte novamente com:\n`
            doc += `👉 \`${prefix}numfake cod\`\n\n`
            doc += `💡 _Se demorar ou preferir outro DDD, use \`${prefix}numfake cancelar\` ou \`${prefix}numfake gerar <ddd>\`._`

            return reply(doc.trim())
        }

        // ═══════════════════════════════════════════════════════════════════
        // 4. SUBCOMANDO: CONFIGURAR CHAVE DE API (.numfake setkey <chave>)
        // ═══════════════════════════════════════════════════════════════════
        if (['setkey', 'apikey', 'key', 'configkey'].includes(sub)) {
            if (!isOwner) {
                return reply('❌ Apenas o dono do bot tem permissão para gerenciar a chave de API de telefonia.')
            }

            if (!param) {
                const currentKey = virtualNumberService.getApiKey()
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🔑 *CONFIGURAÇÃO DE API KEY* ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                if (currentKey) {
                    doc += `✅ *Provedor Ativo:* SMS-Activate.org\n`
                    doc += `🔑 *Chave Atual:* \`***${currentKey.slice(-4)}\`\n\n`
                    doc += `👉 Digite \`${prefix}numfake saldo\` para ver o saldo em rublos/créditos.\n`
                    doc += `👉 Digite \`${prefix}numfake setkey <nova_chave>\` para substituir.\n`
                    doc += `👉 Digite \`${prefix}numfake setkey limpar\` para voltar ao modo Sandbox.`
                } else {
                    doc += `⚠️ *Nenhuma chave configurada* (Modo Sandbox ativo).\n\n`
                    doc += `Para gerar números reais com chips GSM que passam na verificação da Meta/WhatsApp:\n\n`
                    doc += `1️⃣ Obtenha sua API Key em https://sms-activate.org\n`
                    doc += `2️⃣ Ative aqui com o comando:\n`
                    doc += `👉 \`${prefix}numfake setkey SUA_CHAVE_AQUI\``
                }
                return reply(doc.trim())
            }

            if (['limpar', 'remover', 'none', 'delete', 'reset'].includes(param.toLowerCase())) {
                await virtualNumberService.setApiKey('')
                return reply('✅ *Chave removida com sucesso!* O sistema voltou para o modo Sandbox/Simulação.')
            }

            const cleanKey = param.trim()
            await virtualNumberService.setApiKey(cleanKey)

            // Testa a chave consultando o saldo no provedor
            const balRes = await virtualNumberService.getProviderBalance(cleanKey)
            if (balRes && balRes.success) {
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   ✅ *CHAVE SMS-ACTIVATE ATIVA* ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `🎉 *Conexão estabelecida com sucesso!*\n\n`
                doc += `• Provedor: SMS-Activate API v1\n`
                doc += `• Saldo disponível: *${balRes.balance} RUB / Créditos*\n`
                doc += `• Status: 🟢 Chips Reais GSM Habilitados\n\n`
                doc += `A partir de agora, qualquer número gerado com \`${prefix}numfake gerar <ddd>\` será alocado em modems GSM reais com entrega do código autêntico da Meta!`
                return reply(doc.trim())
            } else {
                let doc = `⚠️ *Chave salva, mas houve aviso ao testar:*\n\n`
                doc += `O provedor respondeu: _${balRes?.error || 'Não foi possível conectar'}_.\n\n`
                doc += `Verifique se você colou a chave de API correta obtida no painel da SMS-Activate.org.`
                return reply(doc.trim())
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // 5. SUBCOMANDO: SALDO DO PROVEDOR (.numfake saldo)
        // ═══════════════════════════════════════════════════════════════════
        if (['saldo', 'balance', 'painel'].includes(sub)) {
            const apiKey = virtualNumberService.getApiKey()
            if (!apiKey) {
                return reply(
                    `ℹ️ *Nenhum provedor real conectado.*\n\n` +
                    `O bot está operando em modo Sandbox/Simulação.\n` +
                    (isOwner ? `👉 Configure a chave do SMS-Activate com: \`${prefix}numfake setkey <sua_chave>\`` : '')
                )
            }

            const bal = await virtualNumberService.getProviderBalance()
            if (bal && bal.success) {
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   💰 *SALDO SMS-ACTIVATE* 💰   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `• Saldo em Conta: *${bal.balance} RUB*\n`
                doc += `• Status da Conexão: 🟢 Ativa e Operacional\n`
                doc += `• Provedor: SMS-Activate.org\n\n`
                doc += `💡 _Para adicionar mais fundos à conta, acesse o painel sms-activate.org._`
                return reply(doc.trim())
            } else {
                return reply(`❌ *Erro ao consultar saldo no provedor:* _${bal?.error || 'Falha de conexão'}_`)
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // 6. SUBCOMANDO: CANCELAR E ESTORNAR (.numfake cancelar)
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
        // 7. SUBCOMANDO: SIMULAR SMS (.numfake simularsms [código])
        // ═══════════════════════════════════════════════════════════════════
        if (['simularsms', 'simular', 'testarsms', 'injetsms'].includes(sub)) {
            const statusInfo = await virtualNumberService.checkVirtualNumberStatus(sender)
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
                `👉 Digite \`${prefix}numfake cod\` para visualizar o painel de entrega.`
            )
        }

        // ═══════════════════════════════════════════════════════════════════
        // 8. DASHBOARD PRINCIPAL (.numfake)
        // ═══════════════════════════════════════════════════════════════════
        const saldoAtual = creditsService.saldo(sender)
        const statusInfo = await virtualNumberService.checkVirtualNumberStatus(sender)
        const hasApiKey = Boolean(virtualNumberService.getApiKey())

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🤖 *MELIODAS VIRTUAL NUMBERS* 🤖   ║\n`
        doc += `║       _WhatsApp SMS Activator_       ║\n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `Sistema profissional de números virtuais com escolha de DDD para ativação e recepção de SMS no WhatsApp.\n\n`

        doc += `╭━〔 👤 *SUA CONTA* 〕━⬣\n`
        if (isOwner) {
            doc += `┃ 👑 *Privilégio:* Dono do Bot (ILIMITADO & GRÁTIS)\n`
            doc += `┃ 💰 *Custo por Número:* 0 Créditos\n`
        } else {
            doc += `┃ 👤 *Tipo:* Usuário Comum\n`
            doc += `┃ 💰 *Seu Saldo:* ${saldoAtual} Créditos\n`
            doc += `┃ 🏷️ *Custo por Número:* 5 Créditos\n`
        }
        doc += `┃ 📡 *Provedor GSM:* ${hasApiKey ? '🟢 Conectado (SMS-Activate)' : '🟡 Modo Sandbox'}\n`
        if (statusInfo.hasActive) {
            doc += `┃ 📱 *Número Ativo:* \`${statusInfo.order.phone_number}\`\n`
            doc += `┃ ⏱️ *Tempo Restante:* ${statusInfo.timeLeftFormatted}\n`
            doc += `┃ ⚡ *Status:* ${statusInfo.order.status === 'RECEIVED' ? '✅ SMS Recebido' : '⏳ Aguardando SMS'}\n`
        } else {
            doc += `┃ 📱 *Número Ativo:* Nenhum no momento\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `⚡ *COMANDOS DISPONÍVEIS:*\n`
        doc += `👉 \`${prefix}numfake gerar <ddd>\` — Gera número no DDD escolhido (ex: \`${prefix}numfake gerar 11\` ou \`${prefix}numfake gerar 21\`)\n`
        doc += `👉 \`${prefix}numfake cod\` — Consultar e obter o código SMS recebido\n`
        doc += `👉 \`${prefix}numfake ddds\` — Ver catálogo completo de DDDs do Brasil e EUA\n`
        doc += `👉 \`${prefix}numfake status\` — Exibir status da linha atual\n`
        doc += `👉 \`${prefix}numfake cancelar\` — Cancelar ativação ativa (com estorno imediato)\n`
        if (isOwner) {
            doc += `👉 \`${prefix}numfake setkey <chave>\` — Configurar API Key do SMS-Activate\n`
            doc += `👉 \`${prefix}numfake saldo\` — Consultar saldo no SMS-Activate\n`
            doc += `👉 \`${prefix}numfake simularsms [código]\` — Simular SMS no número ativo\n`
        }
        if (!isOwner) {
            doc += `\n💳 _Precisa de créditos? Use_ \`${prefix}comprarcreditos\` _para recarregar via PIX!_`
        }

        return reply(doc.trim())
    }
}

