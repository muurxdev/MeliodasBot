/**
 * Comando .aluguel / .rent
 * Sistema completo de gerenciamento de aluguel de grupos exclusivo para os 5 Donos do bot.
 */

const rentalService = require('../../services/rentalService')
const { getOwnerRank } = require('../../services/ownerService')
const { getBotName } = require('../../config/botConfig')
const env = require('../../config/env')
const logger = require('../../core/logger')

module.exports = {
    name: 'aluguel',
    aliases: ['rent', 'alugar', 'locacao', 'alugueis'],
    category: 'owner',
    description: 'Gerencia o modo aluguel, prazos customizados, tempo infinito e faturas Pix',
    ownerOnly: false,
    cooldownMs: 2000,
    execute: async ({ from, isGroup, sender, args, text, reply, client, info, quotedSender, isOwner, userRole }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5)
        const sub = (args[0] || '').toLowerCase().trim()
        const fullInput = (text || args.slice(1).join(' ')).trim()

        // 0. TABELA DE PLANOS E PREÇOS (Livre para todos)
        if (sub === 'planos' || sub === 'tabela' || sub === 'valores' || sub === 'precos' || sub === 'preco') {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   💎 *TABELA DE PLANOS & PREÇOS*   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `Escolha a modalidade ideal para liberar os recursos do *${getBotName()}*:\n\n`

            doc += `╭━〔 🏢 1. ALUGUEL DE GRUPO 〕━⬣\n`
            doc += `┃ 🥉 *Semanal (7 Dias):* R$ 15,00\n`
            doc += `┃ 🥈 *Quinzenal (15 Dias):* R$ 25,00\n`
            doc += `┃ 🥇 *Mensal (30 Dias):* R$ 35,00\n`
            doc += `┃ 💎 *Trimestral (90 Dias):* R$ 90,00\n`
            doc += `┃ 🌟 *Anual (365 Dias):* R$ 280,00\n`
            doc += `┃ ♾️ *Vitalício:* A combinar com os Donos\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `╭━〔 👤 2. ALUGUEL DE PV (PRIVADO) 〕━⬣\n`
            doc += `┃ 🥉 *Semanal (7 Dias):* R$ 10,00\n`
            doc += `┃ 🥈 *Quinzenal (15 Dias):* R$ 15,00\n`
            doc += `┃ 🥇 *Mensal (30 Dias):* R$ 20,00\n`
            doc += `┃ 💎 *Trimestral (90 Dias):* R$ 50,00\n`
            doc += `┃ 🌟 *Anual (365 Dias):* R$ 150,00\n`
            doc += `┃ ♾️ *Vitalício:* A combinar com os Donos\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `╭━〔 👑 3. COMBO (GRUPO + PV) 〕━⬣\n`
            doc += `┃ 🥇 *Mensal (30 Dias):* R$ 45,00 _(Economize R$ 10)_\n`
            doc += `┃ 💎 *Trimestral (90 Dias):* R$ 120,00 _(Economize R$ 20)_\n`
            doc += `┃ 🌟 *Anual (365 Dias):* R$ 350,00 _(Super Desconto)_\n`
            doc += `┃ ♾️ *Vitalício Combo:* A combinar com os Donos\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `🎁 *Período de Teste Gratuito:*\n`
            doc += `┃ ⚡ Digite \`.aluguel teste\` para liberar *2 Horas Grátis*!\n\n`

            doc += `💳 *Como Contratar:*\n`
            doc += `┃ 👉 Digite \`.assinar\` para gerar fatura online (Cartão/Pix)\n`
            doc += `┃ 👉 Digite \`.dono\` para falar diretamente com os administradores`

            return reply(doc.trim())
        }

        // 0.1 MODO TESTE GRATUITO (.aluguel teste / .aluguel trial)
        if (sub === 'teste' || sub === 'trial' || sub === 'degustacao') {
            const requestedType = isGroup ? 'group' : 'pv'
            let targetJid = isGroup ? from : sender
            let targetName = isGroup ? 'Grupo de WhatsApp' : (sender.split('@')[0])

            // Se for Dono passando alvo customizado
            if (isUserOwner && args[1]) {
                const resolved = await rentalService.resolveRentalTarget(args[1], { from, isGroup, client })
                if (resolved) {
                    targetJid = resolved.jid
                    targetName = resolved.name
                }
            } else if (isGroup && client) {
                try {
                    const m = await client.groupMetadata(from)
                    if (m?.subject) targetName = m.subject
                } catch (_) {}
            }

            const durationStr = (isUserOwner && args[2]) ? args[2] : '2h'

            try {
                const trial = rentalService.activateTrial({
                    targetJid,
                    targetType: targetJid.endsWith('@g.us') ? 'group' : 'pv',
                    targetName,
                    durationStr,
                    requestedBy: sender
                })

                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🎉 *TESTE GRATUITO ATIVADO!*   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `📌 *Destino:* *${targetName}*\n`
                doc += `⏱️ *Duração da Degustação:* *${durationStr}*\n`
                doc += `⏰ *Expira em:* *${new Date(trial.expiresAt).toLocaleString('pt-BR')}*\n\n`
                doc += `✅ _Todos os comandos e recursos foram liberados para você testar à vontade!_\n\n`
                doc += `💡 _Para assinar e continuar usando após o término:_ \`.aluguel planos\``
                return reply(doc.trim())
            } catch (err) {
                return reply(`${err.message}\n\n💡 _Consulte os planos em_ \`.aluguel planos\` _ou fale com um Dono em_ \`.dono\`.`)
            }
        }

        // 0.2 TOGGLE DO MODO ALUGUEL (.aluguel modo <global|grupo|pv> <on|off>)
        if (sub === 'modo' || sub === 'mode') {
            if (!isUserOwner) {
                return reply('❌ *Acesso Negado:* Apenas Donos do bot podem alterar o Modo Aluguel.')
            }

            const target = (args[1] || '').toLowerCase()
            const state = (args[2] || args[1] || '').toLowerCase()
            const modeOn = state === 'on' || state === 'ativar' || state === '1'

            if (target === 'grupo' || target === 'group') {
                if (!isGroup) return reply('❌ Execute este comando dentro do grupo para alterar o modo do grupo.')
                await rentalService.setRentalMode(modeOn, from)
                return reply(`🛡️ *MODO ALUGUEL DO GRUPO:* ${modeOn ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n${modeOn ? '⚠️ Comandos bloqueados para membros até o grupo ter aluguel configurado.' : '✅ Comandos liberados neste grupo.'}`)
            }

            if (target === 'pv' || target === 'dm') {
                await rentalService.setRentalMode(modeOn, 'pv')
                return reply(`🛡️ *MODO ALUGUEL DO PRIVADO (PV):* ${modeOn ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n${modeOn ? '⚠️ Apenas usuários com plano de PV ou Donos podem usar comandos no privado.' : '✅ Privado liberado para todos.'}`)
            }

            await rentalService.setRentalMode(modeOn, null)
            return reply(`🛡️ *MODO ALUGUEL GLOBAL:* ${modeOn ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n${modeOn ? '⚠️ Grupos e PVs sem aluguel ativo exigirão assinatura.' : '✅ Modo aluguel desativado globalmente.'}`)
        }

        // 0.3 COMANDO VITALÍCIO DIRETO (.aluguel vitalicio <pv|grupo|combo> <alvo>)
        if (sub === 'vitalicio' || sub === 'vitalício' || sub === 'inf' || sub === 'infinito') {
            if (!isUserOwner) {
                return reply('❌ *Acesso Negado:* Apenas Donos do bot podem conceder acesso vitalício.')
            }

            const firstParam = (args[1] || '').toLowerCase()
            let scope = 'group'
            let rawTarget = ''

            if (['pv', 'dm', 'user', 'privado'].includes(firstParam)) {
                scope = 'pv'
                rawTarget = args.slice(2).join(' ')
            } else if (['grupo', 'group', 'grp'].includes(firstParam)) {
                scope = 'group'
                rawTarget = args.slice(2).join(' ')
            } else if (['combo', 'ambos'].includes(firstParam)) {
                scope = 'combo'
                rawTarget = args.slice(2).join(' ')
            } else {
                scope = isGroup ? 'group' : 'pv'
                rawTarget = args.slice(1).join(' ')
            }

            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply(
                    '❌ *Não consegui identificar o destino.*\n\n' +
                    '📌 *Como usar:* `.aluguel vitalicio <pv|grupo|combo> <alvo>`\n\n' +
                    '💡 *Exemplos:*\n' +
                    '• `.aluguel vitalicio pv 11999999999` (Número)\n' +
                    '• `.aluguel vitalicio pv @fulano` (Menção)\n' +
                    '• `.aluguel vitalicio pv Dragão Slayer` (Nick/Nome)\n' +
                    '• `.aluguel vitalicio grupo` (No próprio grupo)\n' +
                    '• `.aluguel vitalicio combo 11999999999` (Grupo + PV)'
                )
            }

            if (scope === 'combo') {
                // Combo: concede vitalício no PV do usuário E no grupo (se estiver em grupo)
                rentalService.setLifetimeRental({
                    targetJid: resolved.jid,
                    targetType: 'pv',
                    targetName: resolved.name,
                    grantedBy: sender,
                    notes: 'Combo Vitalício (PV)'
                })
                if (isGroup) {
                    let groupName = 'Grupo Atual'
                    try {
                        const gm = await client.groupMetadata(from)
                        if (gm?.subject) groupName = gm.subject
                    } catch (_) {}
                    rentalService.setLifetimeRental({
                        targetJid: from,
                        targetType: 'group',
                        targetName: groupName,
                        grantedBy: sender,
                        notes: `Combo Vitalício de @${resolved.jid.split('@')[0]}`
                    })
                }
            } else {
                rentalService.setLifetimeRental({
                    targetJid: resolved.jid,
                    targetType: scope,
                    targetName: resolved.name,
                    grantedBy: sender,
                    notes: `Acesso Vitalício [${scope.toUpperCase()}]`
                })
            }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ♾️ *ACESSO VITALÍCIO CONCEDIDO!*   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `👤 *Beneficiário:* *${resolved.name}*\n`
            doc += `🆔 *Identificador:* \`${resolved.jid}\`\n`
            doc += `📦 *Modalidade:* *${scope.toUpperCase()}*\n`
            doc += `⏳ *Validade:* ♾️ *TEMPO INFINITO (VITALÍCIO)*\n`
            doc += `👑 *Concedido por:* @${sender.split('@')[0]}\n\n`
            doc += `✅ _Comandos liberados permanentemente sem necessidade de renovação!_`

            return reply(doc.trim(), [sender, resolved.jid])
        }

        // Validação de Dono para comandos de escrita subsequentes
        if (!isUserOwner && sub !== 'status' && sub !== '') {
            return reply('❌ *Acesso Negado:* Esta função é de uso exclusivo dos Donos do bot.\n\n💡 *Dica:* Digite `.aluguel planos` para consultar a tabela de aluguéis.')
        }

        // 1. LISTA DE TODOS OS ALUGUÉIS (.aluguel list / .aluguel lista)
        if (sub === 'list' || sub === 'lista') {
            const list = rentalService.getAllRentalsList()
            if (list.length === 0) {
                return reply('📋 *PAINEL DE ALUGUÉIS:*\n\nℹ️ _Nenhum aluguel cadastrado no momento._\n\n💡 _Para definir um aluguel:_ `.aluguel set 30d [pv|grupo] [alvo]`')
            }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📋 *PAINEL GERAL DE ALUGUÉIS*   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📊 *Total de Cadastros:* ${list.length}\n\n`

            list.forEach((r, idx) => {
                const statusEmoji = r.isExpired ? '🔴' : (r.isLifetime ? '♾️' : (r.isTrial ? '⚡' : '🟢'))
                const tipoBadge = r.targetType === 'pv' ? '👤 [PV]' : '🏢 [GRUPO]'
                doc += `╭━〔 #${idx + 1} ${tipoBadge} *${r.targetName || 'Sem Nome'}* 〕━⬣\n`
                doc += `┃ 🆔 \`${r.targetJid || r.groupJid}\`\n`
                doc += `┃ ${statusEmoji} *Status:* ${r.remainingText}\n`
                doc += `┃ 📅 *Expira em:* ${r.expiresAtFormatted}\n`
                if (r.price > 0) doc += `┃ 💰 *Valor:* R$ ${r.price.toFixed(2)}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += `💡 _Para adicionar tempo:_ \`.aluguel add <tempo> [alvo]\``
            return reply(doc.trim())
        }

        // 2. DEFINIR OU RENOVAR ALUGUEL (.aluguel set <tempo> [pv|grupo] [alvo] [valor] [pix])
        if (sub === 'set' || sub === 'definir' || sub === 'novo') {
            const durationStr = args[1] || '30d'
            let scope = 'group'
            let targetArgIndex = 2

            if (['pv', 'dm', 'privado'].includes((args[2] || '').toLowerCase())) {
                scope = 'pv'
                targetArgIndex = 3
            } else if (['grupo', 'group'].includes((args[2] || '').toLowerCase())) {
                scope = 'group'
                targetArgIndex = 3
            }

            const rawTarget = args[targetArgIndex]
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply(
                    '❌ *Alvo não especificado ou não encontrado.*\n\n' +
                    '📌 *Uso:* `.aluguel set <tempo> [pv|grupo] <alvo> [valor] [pix]`\n' +
                    '_Exemplo:_ `.aluguel set 30d pv 11999999999`\n' +
                    '_Exemplo:_ `.aluguel set 30d grupo` (dentro do grupo)'
                )
            }

            const price = parseFloat(args[targetArgIndex + 1]) || 0
            const pixKey = args[targetArgIndex + 2] || ''

            try {
                const rental = rentalService.setRental({
                    targetJid: resolved.jid,
                    targetType: scope,
                    targetName: resolved.name,
                    renterJid: resolved.jid,
                    rentedBy: sender,
                    durationStr,
                    price,
                    pixKey
                })

                const isLifetime = rental.isLifetime
                const duracaoTexto = isLifetime ? '♾️ VITALÍCIO' : durationStr
                const expiraTexto = isLifetime ? '♾️ Permanente' : new Date(rental.expiresAt).toLocaleString('pt-BR')

                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🎉 *ALUGUEL ATIVADO COM SUCESSO*   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `📌 *Destino:* *${resolved.name}* [${scope.toUpperCase()}]\n`
                doc += `🆔 *JID:* \`${resolved.jid}\`\n`
                doc += `⏱️ *Duração:* *${duracaoTexto}*\n`
                doc += `📅 *Válido até:* *${expiraTexto}*\n`
                if (price > 0) doc += `💰 *Valor:* R$ ${price.toFixed(2)}\n`
                if (pixKey) doc += `🔑 *Chave Pix:* \`${pixKey}\`\n`
                doc += `👑 *Ativado por:* @${sender.split('@')[0]}\n\n`
                doc += `✅ _O bot está liberado para operar durante o período contratado._`

                return reply(doc.trim(), [sender, resolved.jid])
            } catch (err) {
                return reply(`❌ *Erro ao definir aluguel:* ${err.message}`)
            }
        }

        // 3. ADICIONAR TEMPO EXTRA (.aluguel add 15d [alvo])
        if (sub === 'add' || sub === 'estender' || sub === 'mais') {
            const durationStr = args[1] || '30d'
            const rawTarget = args[2]
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply('❌ Informe o alvo ou execute dentro do grupo desejado.')
            }

            try {
                const rental = rentalService.addRentalTime(resolved.jid, durationStr, sender)
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   ⏳ *ALUGUEL ESTENDIDO* ⏳   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `📌 *Destino:* *${rental.targetName || resolved.name}*\n`
                doc += `➕ *Tempo Adicionado:* *+${durationStr}*\n`
                doc += `📅 *Novo Vencimento:* *${rental.isLifetime ? '♾️ Vitalício' : new Date(rental.expiresAt).toLocaleString('pt-BR')}*\n\n`
                doc += `✅ _Aluguel renovado com sucesso!_`

                return reply(doc.trim())
            } catch (err) {
                return reply(`❌ *Erro ao estender aluguel:* ${err.message}`)
            }
        }

        // 4. REMOVER ALUGUEL (.aluguel del [alvo])
        if (sub === 'del' || sub === 'off' || sub === 'remover' || sub === 'cancelar') {
            const rawTarget = args[1]
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply('❌ Informe o alvo para remover o aluguel.')
            }

            rentalService.removeRental(resolved.jid)
            logger.info(`[RENTAL DELETE] ${sender} removeu o aluguel de ${resolved.jid}`)
            return reply(`🔓 *ALUGUEL REMOVIDO:*\n\nO registro de aluguel de *${resolved.name}* (\`${resolved.jid}\`) foi cancelado.`)
        }

        // 5. STATUS ATUAL DO ALUGUEL (.aluguel / .aluguel status)
        if (isGroup) {
            const isModeActive = rentalService.isRentalModeEnabled(from, true)
            const r = rentalService.getRentalInfo(from)

            if (!r) {
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   📌 *STATUS DO ALUGUEL* 📌   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `🛡️ *Modo Aluguel no Grupo:* ${isModeActive ? '🟢 ATIVO (Exige Assinatura)' : '⚪ DESATIVADO (Livre)'}\n`
                doc += `ℹ️ *Status de Registro:* _Nenhum aluguel cadastrado para este grupo._\n\n`
                doc += `🎁 *Experimente grátis:* Digite \`.aluguel teste\` para *2 Horas Gratuitas*!\n`
                doc += `💡 Digite \`.aluguel planos\` para ver os valores.\n`
                if (isUserOwner) doc += `👑 *Donos:* Digite \`.aluguel vitalicio grupo\` para liberar este grupo.`
                return reply(doc.trim())
            }

            const statusEmoji = r.isExpired ? '🔴' : (r.isLifetime ? '♾️' : (r.isTrial ? '⚡' : '🟢'))
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📌 *STATUS DO ALUGUEL* 📌   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Grupo:* *${r.groupName || 'Grupo'}*\n`
            doc += `🛡️ *Modo Aluguel:* ${isModeActive ? '🟢 ATIVO' : '⚪ DESATIVADO'}\n`
            doc += `${statusEmoji} *Status do Prazo:* *${r.remainingText}*\n`
            doc += `📅 *Início:* ${r.startsAtFormatted}\n`
            doc += `⏰ *Vencimento:* *${r.expiresAtFormatted}*\n`
            if (r.price > 0) doc += `💰 *Valor:* R$ ${r.price.toFixed(2)}\n`
            if (r.pixKey) doc += `🔑 *Pix para Renovação:* \`${r.pixKey}\`\n\n`
            doc += `💡 _Para renovar:_ \`.aluguel add 30d\` ou \`.assinar\``

            return reply(doc.trim())
        }

        // No Privado (PV)
        const isPvModeActive = rentalService.isRentalModeEnabled(sender, false)
        const pvInfo = rentalService.getRentalInfo(sender)

        let pvDoc = `╔══════════════════════════════╗\n`
        pvDoc += `║   👤 *STATUS DO SEU ACESSO PV* 👤   ║\n`
        pvDoc += `╚══════════════════════════════╝\n\n`
        pvDoc += `🛡️ *Modo Aluguel PV:* ${isPvModeActive ? '🟢 ATIVO' : '⚪ DESATIVADO'}\n`

        if (pvInfo && !pvInfo.isExpired) {
            const statusEmoji = pvInfo.isLifetime ? '♾️' : (pvInfo.isTrial ? '⚡' : '🟢')
            pvDoc += `${statusEmoji} *Status:* *${pvInfo.remainingText}*\n`
            pvDoc += `📅 *Expira em:* *${pvInfo.expiresAtFormatted}*\n\n`
            pvDoc += `✅ _Seu acesso ao privado está totalmente liberado!_`
        } else {
            pvDoc += `🔴 *Status:* _Sem plano de PV ativo._\n\n`
            pvDoc += `🎁 *Experimente grátis:* Digite \`.aluguel teste\` para *2 Horas de Degustação*!\n`
            pvDoc += `💡 Digite \`.aluguel planos\` para ver os valores de PV e Combo.\n`
        }

        if (isUserOwner) {
            pvDoc += `\n\n👑 *Comandos Rápidos do Dono:*\n`
            pvDoc += `• \`.aluguel vitalicio pv <número|nick>\` — Vitalício PV\n`
            pvDoc += `• \`.aluguel vitalicio grupo\` — Vitalício no Grupo\n`
            pvDoc += `• \`.aluguel modo pv on/off\` — Alternar modo PV\n`
            pvDoc += `• \`.aluguel list\` — Painel geral`
        }

        return reply(pvDoc.trim())
    }
}

