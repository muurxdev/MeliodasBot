/**
 * MeliodasBot — Comando .aluguel / .rent
 * Sistema completo de gerenciamento de aluguel de grupos exclusivo para os 5 Donos do bot.
 */

const rentalService = require('../../services/rentalService')
const { getOwnerRank } = require('../../services/ownerService')
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
            doc += `📌 *Planos Sugeridos de Aluguel:*\n\n`
            doc += `🥉 *Plano Semanal (7 Dias)*\n`
            doc += `┃ 💰 *Valor:* R$ 15,00\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set 7d 15.00 [pix]\`\n\n`
            doc += `🥈 *Plano Quinzenal (15 Dias)*\n`
            doc += `┃ 💰 *Valor:* R$ 25,00\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set 15d 25.00 [pix]\`\n\n`
            doc += `🥇 *Plano Mensal (30 Dias)*\n`
            doc += `┃ 💰 *Valor:* R$ 35,00\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set 30d 35.00 [pix]\`\n\n`
            doc += `💎 *Plano Trimestral (90 Dias / 3 Meses)*\n`
            doc += `┃ 💰 *Valor:* R$ 90,00 (Economize R$ 15)\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set 90d 90.00 [pix]\`\n\n`
            doc += `👑 *Plano Semestral (180 Dias / 6 Meses)*\n`
            doc += `┃ 💰 *Valor:* R$ 160,00 (Economize R$ 50)\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set 180d 160.00 [pix]\`\n\n`
            doc += `🌟 *Plano Anual (365 Dias / 1 Ano)*\n`
            doc += `┃ 💰 *Valor:* R$ 280,00 (Super Desconto)\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set 365d 280.00 [pix]\`\n\n`
            doc += `♾️ *Plano Vitalício (Tempo Infinito)*\n`
            doc += `┃ 💰 *Valor:* A Combinar com os Donos\n`
            doc += `┃ ⚙️ *Comando Dono:* \`.aluguel set vitalicio [valor] [pix]\`\n\n`
            doc += `⚡ *Plano Personalizado:*\n`
            doc += `┃ 👑 Como Dono, você pode estipular qualquer tempo e valor!\n`
            doc += `┃ 👉 Ex: \`.aluguel set 45d 50.00 chave@pix\`\n`
            doc += `┃ 👉 Ex: \`.aluguel set 12h 5.00 chave@pix\`\n\n`
            doc += `💡 _Para contratar ou falar com um Dono:_ \`.dono\``

            return reply(doc.trim())
        }

        // 0.1 TOGGLE DO MODO ALUGUEL (.aluguel modo on/off)
        if (sub === 'modo' || sub === 'mode') {
            if (!isUserOwner) {
                return reply('❌ *Acesso Negado:* Apenas Donos do bot podem ativar ou desativar o Modo Aluguel.')
            }

            const target = (args[1] || '').toLowerCase()
            if (target === 'grupo' || target === 'group') {
                if (!isGroup) return reply('❌ Execute este comando dentro do grupo para alterar o modo específico.')
                const modeOn = args[2]?.toLowerCase() === 'on' || args[2]?.toLowerCase() === 'ativar' || args[2]?.toLowerCase() === '1'
                await rentalService.setRentalMode(modeOn, from)
                return reply(`🛡️ *MODO ALUGUEL DO GRUPO:* ${modeOn ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n${modeOn ? '⚠️ Comandos bloqueados para membros até o aluguel ser configurado pelos Donos.' : '✅ Modo aluguel liberado. O bot atenderá todos normalmente.'}`)
            }

            const modeOn = args[1]?.toLowerCase() === 'on' || args[1]?.toLowerCase() === 'ativar' || args[1]?.toLowerCase() === '1'
            await rentalService.setRentalMode(modeOn, null)
            return reply(`🛡️ *MODO ALUGUEL GLOBAL:* ${modeOn ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n${modeOn ? '⚠️ Todos os grupos sem aluguel ativo exigirão pagamento para liberar os comandos.' : '✅ Modo aluguel desativado globalmente. Todos os grupos operam normalmente.'}`)
        }

        // Validação de Dono para comandos de escrita
        if (!isUserOwner && sub !== 'status' && sub !== '') {
            return reply('❌ *Acesso Negado:* Esta função é de uso exclusivo dos Donos do bot.\n\n💡 *Dica:* Digite `.aluguel planos` para consultar a tabela de aluguéis.')
        }

        // 1. LISTA DE TODOS OS ALUGUÉIS (.aluguel list / .aluguel lista)
        if (sub === 'list' || sub === 'lista') {
            const list = rentalService.getAllRentalsList()
            if (list.length === 0) {
                return reply('📋 *PAINEL DE ALUGUÉIS:*\n\nℹ️ _Nenhum grupo com aluguel cadastrado no momento._\n\n💡 _Para definir um aluguel:_ `.aluguel set 30d [valor] [pix]` no grupo desejado.')
            }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📋 *PAINEL GERAL DE ALUGUÉIS*   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📊 *Total de Grupos Alugados:* ${list.length}\n\n`

            list.forEach((r, idx) => {
                const statusEmoji = r.isExpired ? '🔴' : '🟢'
                doc += `╭━〔 #${idx + 1} — *${r.groupName || 'Grupo Sem Nome'}* 〕━⬣\n`
                doc += `┃ 🆔 \`${r.groupJid}\`\n`
                doc += `┃ ${statusEmoji} *Status:* ${r.remainingText}\n`
                doc += `┃ 📅 *Expira em:* ${r.expiresAtFormatted}\n`
                if (r.price > 0) doc += `┃ 💰 *Valor:* R$ ${r.price.toFixed(2)}\n`
                if (r.renterJid) doc += `┃ 👤 *Cliente:* @${r.renterJid.split('@')[0]}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += `💡 _Para estender um aluguel:_ \`.aluguel add <tempo>\``
            return reply(doc.trim())
        }

        // 2. DEFINIR OU RENOVAR ALUGUEL (.aluguel set 30d [valor] [pix] ou .aluguel vitalicio)
        if (sub === 'set' || sub === 'definir' || sub === 'novo' || sub === 'vitalicio' || sub === 'vitalício' || sub === 'inf' || sub === 'infinito') {
            let targetGroup = from
            let durationStr = (sub === 'vitalicio' || sub === 'vitalício' || sub === 'inf' || sub === 'infinito') ? 'inf' : (args[1] || '30d')
            let price = 0
            let pixKey = ''

            // Se for no PV e o dono passou o ID do grupo como primeiro param
            if (!isGroup) {
                if (args[1] && (args[1].endsWith('@g.us') || args[1].length >= 15)) {
                    targetGroup = args[1]
                    durationStr = (sub === 'vitalicio' || sub === 'vitalício' || sub === 'inf' || sub === 'infinito') ? 'inf' : (args[2] || '30d')
                    price = parseFloat(args[3]) || 0
                    pixKey = args[4] || ''
                } else {
                    return reply('❌ No privado, informe o ID do grupo:\n\n📌 *Exemplo:* `.aluguel set 120363000000@g.us inf 0 chave@pix`')
                }
            } else {
                if (sub === 'vitalicio' || sub === 'vitalício' || sub === 'inf' || sub === 'infinito') {
                    price = parseFloat(args[1]) || 0
                    pixKey = args[2] || ''
                } else {
                    price = parseFloat(args[2]) || 0
                    pixKey = args[3] || ''
                }
            }

            let groupName = 'Grupo de WhatsApp'
            try {
                const meta = await client.groupMetadata(targetGroup)
                if (meta && meta.subject) groupName = meta.subject
            } catch (_) {}

            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const renterJid = mentioned || quotedSender || ''

            try {
                const rental = rentalService.setRental({
                    groupJid: targetGroup,
                    groupName,
                    renterJid,
                    rentedBy: sender,
                    durationStr,
                    price,
                    pixKey
                })

                const ownerRank = getOwnerRank(sender)
                const authorName = ownerRank?.name ? `${ownerRank.rank}: ${ownerRank.name}` : sender.split('@')[0]
                const isLifetime = ['inf', 'infinito', 'vitalicio', 'vitalício', 'permanente', 'ilimitado', 'sempre', '0'].includes(durationStr.toLowerCase()) || rental.expiresAt >= 50 * 365 * 86400 * 1000
                const duracaoTexto = isLifetime ? '♾️ VITALÍCIO (TEMPO INFINITO)' : durationStr
                const expiraTexto = isLifetime ? '♾️ Permanente (Sem Data de Expiração)' : new Date(rental.expiresAt).toLocaleString('pt-BR')

                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🎉 *ALUGUEL ATIVADO COM SUCESSO*   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `📌 *Grupo:* *${groupName}*\n`
                doc += `⏱️ *Duração:* *${duracaoTexto}*\n`
                doc += `📅 *Válido até:* *${expiraTexto}*\n`
                if (price > 0) doc += `💰 *Valor:* R$ ${price.toFixed(2)}\n`
                if (pixKey) doc += `🔑 *Chave Pix:* \`${pixKey}\`\n`
                if (renterJid) doc += `👤 *Contratante:* @${renterJid.split('@')[0]}\n`
                doc += `👑 *Ativado por:* *${authorName}*\n\n`
                doc += `✅ _O bot está liberado para operar normalmente neste grupo durante o período contratado._`

                return reply(doc.trim(), renterJid ? [renterJid, sender] : [sender])
            } catch (err) {
                return reply(`❌ *Erro ao definir aluguel:* ${err.message}`)
            }
        }

        // 3. ADICIONAR TEMPO EXTRA (.aluguel add 15d)
        if (sub === 'add' || sub === 'estender' || sub === 'mais') {
            const durationStr = args[1] || '30d'
            const targetGroup = from

            if (!isGroup) {
                return reply('❌ Use este comando dentro do grupo que deseja estender o aluguel.')
            }

            try {
                const rental = rentalService.addRentalTime(targetGroup, durationStr, sender)
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   ⏳ *ALUGUEL ESTENDIDO* ⏳   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `📌 *Grupo:* *${rental.groupName || 'Grupo'}*\n`
                doc += `➕ *Tempo Adicionado:* *+${durationStr}*\n`
                doc += `📅 *Novo Vencimento:* *${new Date(rental.expiresAt).toLocaleString('pt-BR')}*\n\n`
                doc += `✅ _Aluguel renovado com sucesso!_`

                return reply(doc.trim())
            } catch (err) {
                return reply(`❌ *Erro ao estender aluguel:* ${err.message}`)
            }
        }

        // 4. REMOVER ALUGUEL (.aluguel del / .aluguel off)
        if (sub === 'del' || sub === 'off' || sub === 'remover' || sub === 'cancelar') {
            const targetGroup = (!isGroup && args[1]) ? args[1] : from
            rentalService.removeRental(targetGroup)
            logger.info(`[RENTAL DELETE] ${sender} removeu o aluguel do grupo ${targetGroup}`)
            return reply(`🔓 *ALUGUEL REMOVIDO COM SUCESSO:*\n\nO registro de aluguel do grupo foi cancelado.`)
        }

        // 5. COBRANÇA PIX PARA CLIENTE (.aluguel cobrar @cliente 35.00 chave@pix)
        if (sub === 'cobrar' || sub === 'pix' || sub === 'pagar') {
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const clientJid = mentioned || quotedSender || null
            const valorStr = args.find(a => /^\d+(\.\d{1,2})?$/.test(a)) || '30.00'
            const valor = parseFloat(valorStr)
            const chavePix = args.find(a => a.includes('@') || a.length >= 11 || a.includes('.')) || 'Contate o Dono'

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   💳 *FATURA DE ALUGUEL DO BOT*   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            if (clientJid) doc += `👤 *Cliente:* @${clientJid.split('@')[0]}\n`
            doc += `💰 *Valor do Plano Mensal:* R$ ${valor.toFixed(2)}\n`
            doc += `🔑 *Chave Pix para Pagamento:* \`${chavePix}\`\n\n`
            doc += `📝 *Instruções:*\n`
            doc += `1. Realize o Pix no valor indicado acima.\n`
            doc += `2. Envie o comprovante para um dos Donos do bot.\n`
            doc += `3. O bot será ativado e renovado imediatamente no grupo!\n\n`
            doc += `👑 *Atendimento:* Donos Oficiais do MeliodasBot`

            return reply(doc.trim(), clientJid ? [clientJid] : [])
        }

        // 6. CONSULTAR STATUS ATUAL DO GRUPO (.aluguel / .aluguel status)
        if (isGroup) {
            const isModeActive = rentalService.isRentalModeEnabled(from)
            const r = rentalService.getRentalInfo(from)
            if (!r) {
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   📌 *STATUS DO ALUGUEL* 📌   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `🛡️ *Modo Aluguel no Grupo:* ${isModeActive ? '🟢 ATIVO (Exige Aluguel)' : '⚪ DESATIVADO (Livre)'}\n`
                doc += `ℹ️ *Status de Registro:* _Nenhum aluguel cadastrado para este grupo._\n\n`
                if (isModeActive) {
                    doc += `⚠️ *Atenção:* Comandos normais bloqueados até que o aluguel seja ativado.\n`
                    doc += `💡 Digite \`.aluguel planos\` para ver os valores.\n`
                }
                doc += `👑 *Donos:* Usem \`.aluguel set 30d\` ou \`.aluguel set inf\` para registrar o grupo.`
                return reply(doc.trim())
            }

            const statusEmoji = r.isExpired ? '🔴' : '🟢'
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📌 *STATUS DO ALUGUEL* 📌   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Grupo:* *${r.groupName || 'Grupo'}*\n`
            doc += `🛡️ *Modo Aluguel:* ${isModeActive ? '🟢 ATIVO' : '⚪ DESATIVADO'}\n`
            doc += `${statusEmoji} *Status do Prazo:* *${r.remainingText}*\n`
            doc += `📅 *Início:* ${r.startsAtFormatted}\n`
            doc += `⏰ *Vencimento:* *${r.expiresAt >= 50 * 365 * 86400 * 1000 ? '♾️ Vitalício (Sem Expiração)' : r.expiresAtFormatted}*\n`
            if (r.price > 0) doc += `💰 *Valor:* R$ ${r.price.toFixed(2)}\n`
            if (r.renterJid) doc += `👤 *Contratante:* @${r.renterJid.split('@')[0]}\n`
            if (r.pixKey) doc += `🔑 *Pix para Renovação:* \`${r.pixKey}\`\n\n`
            doc += `💡 _Para renovar ou estender:_ \`.aluguel add 30d\` ou \`.aluguel set vitalicio\``

            return reply(doc.trim(), r.renterJid ? [r.renterJid] : [])
        }

        // Guia Geral no Privado
        let guia = `╔══════════════════════════════╗\n`
        guia += `║    👑 *PAINEL DE ALUGUÉIS* 👑    ║\n`
        guia += `╚══════════════════════════════╝\n\n`
        guia += `📌 *Comandos Disponíveis (Apenas Donos):*\n\n`
        guia += `• \`.aluguel modo <on|off>\` — Ativar/desativar modo aluguel global\n`
        guia += `• \`.aluguel modo grupo <on|off>\` — Ativar/desativar modo aluguel no grupo\n`
        guia += `• \`.aluguel set <tempo> [valor] [pix]\` — Ativar aluguel (ex: 30d, 7d, vitalicio)\n`
        guia += `• \`.aluguel add <tempo>\` — Estender o prazo atual\n`
        guia += `• \`.aluguel list\` — Listar todos os grupos alugados\n`
        guia += `• \`.aluguel status\` — Ver tempo restante no grupo atual\n`
        guia += `• \`.aluguel cobrar @user [valor] [pix]\` — Gerar fatura Pix\n`
        guia += `• \`.aluguel del\` — Cancelar aluguel do grupo\n`

        return reply(guia.trim())
    }
}

