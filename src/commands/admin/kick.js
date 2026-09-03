/**
 * Comando .kick / .ban / .remover
 * Remove um membro do grupo com validação de admin e LID
 */

const logger = require('../../core/logger');
const groupAuthService = require('../../services/groupAuthService');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'kick',
    aliases: ['ban', 'remover', 'expulsar'],
    category: 'admin',
    description: 'Remove um membro do grupo',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ info, from, sender, client, reply, mentioned }) => {
        const botName = getBotName();
        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        const userKick = mentioned || quotedParticipant;

        if (!userKick) {
            return reply('❌ *Uso incorreto:* Marque a mensagem ou usuário com `.kick @usuario`');
        }

        let apiJid = null;
        try {
            const groupData = await groupAuthService.getGroupData(from, { refresh: true });

            const isSenderAdmin = Array.from(groupData.admins).some(a => groupAuthService.sameUser(a, sender));
            if (!isSenderAdmin) {
                return reply('❌ *Autenticação negada:* você não é administrador deste grupo.');
            }

            if (!groupData.isBotAdmin) {
                return reply('❌ O bot não é administrador deste grupo. Promova o bot para executar esta ação.');
            }

            apiJid = await groupAuthService.resolveMemberJid(client, userKick, groupData) || userKick;

            const isParticipant = groupData.participants.some(p =>
                groupAuthService.sameUser(p.id, apiJid));
            if (!isParticipant) {
                return reply('❌ O marcado não é participante deste grupo.');
            }

            await client.groupParticipantsUpdate(from, [apiJid], 'remove');
            groupAuthService.invalidate(from);
            logger.info(`[KICK] Admin removeu ${userKick} (api=${apiJid}) de ${from}`);

            const targetNum = userKick.split('@')[0].split(':')[0];
            const senderNum = sender.split('@')[0].split(':')[0];

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🚫 *MEMBRO REMOVIDO DO GRUPO* 🚫   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 📋 DETALHES DA REMOÇÃO 〕━⬣\n`;
            doc += `┃ 👤 *Membro Removido:* @${targetNum}\n`;
            doc += `┃ 🚫 *Motivo:* Expulsão por Administrador\n`;
            doc += `┃ 🛡️ *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [userKick, sender]
            });
        } catch (err) {
            logger.error('[KICK ERROR]', err);
            await reply('❌ *Falha ao remover!* O WhatsApp pode ter bloqueado a ação ou o bot não é admin do grupo.');
        }
    }
};