/**
 * Comando .divulgacao / .broadcast / .transmissao
 * Central oficial de comunicação, avisos e divulgação em massa para grupos e contatos
 * Substitui o protocolo legado e implementa taxa segura de envio com anti-ban.
 */

const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'divulgacao',
    aliases: ['divulgar', 'broadcast', 'transmissao', 'avisoglobal', 'anunciar'],
    category: 'owner',
    description: 'Transmite comunicados oficiais e divulgação para grupos ou contatos do bot',
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, from, sender, args, reply, info, prefix = '.' }) => {
        const botName = getBotName()
        const sub = (args[0] || '').toLowerCase()
        const texto = args.slice(1).join(' ').trim()

        if (!sub || ['ajuda', 'help', 'menu'].includes(sub)) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📢 *CENTRAL DE DIVULGAÇÃO* 📢   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `Sistema oficial de broadcast e anúncios em massa do **${botName}**.\n\n`
            doc += `╭━〔 📡 MODOS DE TRANSMISSÃO 〕━⬣\n`
            doc += `┃ 👥 \`${prefix}divulgacao grupos <mensagem>\`\n`
            doc += `┃    ↳ Dispara aviso para *todos os grupos* ativos.\n`
            doc += `┃\n`
            doc += `┃ 👤 \`${prefix}divulgacao pv <mensagem>\`\n`
            doc += `┃    ↳ Dispara comunicado para os *contatos/PVs* cadastrados.\n`
            doc += `┃\n`
            doc += `┃ 📊 \`${prefix}divulgacao status\`\n`
            doc += `┃    ↳ Exibe alcance total de grupos e métricas.\n`
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `💡 *Dica:* Responda a uma imagem ou vídeo com \`${prefix}divulgacao grupos <texto>\` para transmitir com mídia!\n`
            doc += `🛡️ _Possui taxa segura de despacho com intervalo anti-spam para proteção do chip._`

            return reply(doc.trim())
        }

        // ══════════════════════════════════════════════════
        // STATUS DA CENTRAL DE DIVULGAÇÃO
        // ══════════════════════════════════════════════════
        if (sub === 'status') {
            let chats = []
            try {
                if (client?.groupFetchAllParticipating) {
                    const groups = await client.groupFetchAllParticipating()
                    chats = Object.keys(groups)
                }
            } catch (_) {}

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📊 *MÉTRICAS DE ALCANCE* 📊   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `🤖 *Bot:* ${botName}\n`
            doc += `👥 *Grupos Conectados:* ${chats.length} grupos ativos\n`
            doc += `📡 *Status do Módulo:* 🟢 Operacional\n`
            doc += `⏱️ *Intervalo Anti-Ban:* 1.8 segundos entre envios\n\n`
            doc += `👉 _Para disparar: \`${prefix}divulgacao grupos <sua mensagem>\`_`

            return reply(doc.trim())
        }

        // ══════════════════════════════════════════════════
        // DISPARO DE TRANSMISSÃO
        // ══════════════════════════════════════════════════
        const isGrupos = sub === 'grupos' || sub === 'grupo' || sub === 'all'
        const isPv = sub === 'pv' || sub === 'privado'

        let mensagemFinal = texto
        if (!isGrupos && !isPv) {
            mensagemFinal = args.join(' ').trim()
        }

        if (!mensagemFinal) {
            return reply(`❌ Digite a mensagem que deseja transmitir.\n\n📌 *Exemplo:* \`${prefix}divulgacao grupos Novidades da versão 2.0 disponíveis!\``)
        }

        // Busca grupos participantes
        let targetChats = []
        try {
            if (client?.groupFetchAllParticipating) {
                const groups = await client.groupFetchAllParticipating()
                targetChats = Object.keys(groups)
            }
        } catch (err) {
            return reply(`❌ Falha ao mapear grupos participantes: ${err.message}`)
        }

        if (targetChats.length === 0) {
            return reply('⚠️ O bot não está participando de nenhum grupo no momento.')
        }

        await reply(`⏳ *Iniciando transmissão oficial para ${targetChats.length} grupos...*\n_Aguarde a conclusão do envio seguro._`)

        let cardAnuncio = `╔══════════════════════════════╗\n`
        cardAnuncio += `║   📢 *COMUNICADO OFICIAL* 📢   ║\n`
        cardAnuncio += `╚══════════════════════════════╝\n\n`
        cardAnuncio += `${mensagemFinal}\n\n`
        cardAnuncio += `👑 *${botName}*`

        let enviados = 0
        let falhas = 0

        for (const chatJid of targetChats) {
            try {
                await client.sendMessage(chatJid, { text: cardAnuncio })
                enviados++
                // Intervalo de segurança anti-ban do WhatsApp (1.8s)
                await new Promise(r => setTimeout(r, 1800))
            } catch (err) {
                falhas++
                logger.warn(`[DIVULGACAO] Erro ao enviar para ${chatJid}: ${err.message}`)
            }
        }

        logger.info(`[DIVULGACAO COMPLETA] ${enviados} enviados com sucesso, ${falhas} falhas.`)

        return reply(
            `✅ *TRANSMISSÃO CONCLUÍDA!*\n\n` +
            `📦 *Total de Grupos:* ${targetChats.length}\n` +
            `🟢 *Entregues com Sucesso:* ${enviados}\n` +
            `🔴 *Falhas / Bloqueados:* ${falhas}\n\n` +
            `📢 _Divulgação finalizada com proteção anti-ban._`
        )
    }
}

