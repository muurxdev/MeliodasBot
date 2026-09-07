/**
 * Comando .limparavisos / .resetwarns / .rwarns
 * Reseta as advertências de um usuário específico ou de todos os membros do grupo
 */

const dataService = require('../../services/dataService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'limparavisos',
    aliases: ['resetwarns', 'rwarns', 'zeraravisos', 'unwarn', 'delwarn', 'limparwarns'],
    category: 'admin',
    description: 'Reseta as advertências de um membro ou de todos no grupo',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args = [], mentioned, info, reply, isOwner, isAdmin, sender, prefix = '.' }) => {
        const botName = getBotName();
        if (!isAdmin && !isOwner) {
            return reply('🚫 *Apenas administradores podem resetar advertências.*');
        }

        const sub = (args[0] || '').toLowerCase().trim();
        const senderNum = sender.split('@')[0].split(':')[0];
        const warns = dataService.getWarnsData();

        // 1. Resetar todas as advertências do grupo (.limparavisos all / .resetwarns all)
        if (['all', 'todos', 'tudo', 'grupo'].includes(sub)) {
            let zerados = 0;
            try {
                const metadata = await client.groupMetadata(from);
                const participants = metadata?.participants || [];
                for (const p of participants) {
                    if (warns[p.id]) {
                        warns[p.id] = 0;
                        zerados++;
                    }
                }
            } catch (_) {
                // Fallback: se não conseguir metadata, zera todos os registros conhecidos
                for (const k of Object.keys(warns)) {
                    warns[k] = 0;
                    zerados++;
                }
            }

            await dataService.saveWarnsData(warns);
            logger.info(`[RESET WARNS] Admin ${sender} resetou advertências de todos em ${from}`);

            return reply(`✅ *ADVERTÊNCIAS ZERADAS!*\n\nTodas as advertências deste grupo foram resetadas com sucesso por @${senderNum} (${zerados} membro(s) limpo(s)).`, [sender]);
        }

        // 2. Resetar advertência de usuário específico
        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        let targetJid = mentioned || quotedParticipant;

        if (!targetJid && args.length > 0) {
            const cleanNum = args[0].replace(/[@\s]/g, '').replace(/\D/g, '');
            if (cleanNum.length >= 8) {
                targetJid = cleanNum + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            return reply(
                `📌 *Uso do comando:*\n\n` +
                `• \`${prefix}limparavisos @usuario\` — Zera as advertências de um membro\n` +
                `• \`${prefix}limparavisos all\` — Zera as advertências de TODOS no grupo\n\n` +
                `👑 *${botName}*`
            );
        }

        const targetNum = targetJid.split('@')[0].split(':')[0];
        const anteriores = warns[targetJid] || 0;
        warns[targetJid] = 0;
        await dataService.saveWarnsData(warns);

        logger.info(`[RESET WARNS] Admin ${sender} resetou advertências de ${targetJid} (tinha ${anteriores})`);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ✨ *ADVERTÊNCIAS RESETADAS* ✨   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 📋 FICHA DE CONDUTA 〕━⬣\n`;
        doc += `┃ 👤 *Membro:* @${targetNum}\n`;
        doc += `┃ ⚠️ *Avisos Anteriores:* ${anteriores}\n`;
        doc += `┃ 🟢 *Saldo Atual:* *0 Advertências*\n`;
        doc += `┃ 🛡️ *Autorizado por:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        await client.sendMessage(from, {
            text: doc.trim(),
            mentions: [targetJid, sender]
        });
    }
};

