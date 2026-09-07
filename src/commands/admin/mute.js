/**
 * Comando .mute / .mutar / .silenciar
 * Silencia um membro no grupo com tempo determinado e motivo
 */

const muteService = require("../../services/muteService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "mute",
    aliases: ["silenciar", "mutar", "calaboca"],
    category: "admin",
    description: "Silencia um usuário no grupo por tempo determinado",
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args = [], mentioned, info, reply, isOwner, isAdmin, sender, prefix = '.' }) => {
        const botName = getBotName();
        if (!isAdmin && !isOwner) {
            return reply("🚫 *Apenas administradores podem silenciar membros.*");
        }

        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        let targetJid = mentioned || quotedParticipant;
        let remainingArgs = [...args];

        if (!targetJid && remainingArgs.length > 0) {
            const firstArg = remainingArgs[0].replace(/[@\s]/g, "").replace(/\D/g, "");
            if (firstArg.length >= 8) {
                targetJid = firstArg + "@s.whatsapp.net";
                remainingArgs.shift();
            }
        }

        if (!targetJid) {
            let help = `╔══════════════════════════════╗\n`;
            help += `║   🔇 *SISTEMA DE MUTE / SILÊNCIO*   ║\n`;
            help += `╚══════════════════════════════╝\n\n`;
            help += `📌 *Uso:* \`${prefix}mute @usuario [tempo] [motivo]\`\n\n`;
            help += `╭━〔 ⏱️ EXEMPLOS DE USO 〕━⬣\n`;
            help += `┃ ➤ \`${prefix}mute @usuario\` (Padrão: 15 minutos)\n`;
            help += `┃ ➤ \`${prefix}mute @usuario 10m Spam no chat\`\n`;
            help += `┃ ➤ \`${prefix}mute @usuario 1h Desrespeito às regras\`\n`;
            help += `┃ ➤ \`${prefix}mute @usuario 1d Ofensas recorrentes\`\n`;
            help += `┃ ➤ \`${prefix}mute @usuario 0 Motivo grave\` (Indefinido)\n`;
            help += `┃\n`;
            help += `┃ 🔓 \`${prefix}unmute @usuario\` ➔ Desmutar membro\n`;
            help += `┃ 📋 \`${prefix}mutados\` ➔ Listar silenciados no grupo\n`;
            help += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            help += `👑 *${botName}*`;
            return reply(help.trim());
        }

        // Analisa tempo e motivo
        let durationMinutes = '15m';
        let reason = 'Conduta inadequada ou flood';

        if (remainingArgs.length > 0) {
            const possibleDuration = remainingArgs[0].trim();
            if (/^\d+(s|m|h|d)?$/i.test(possibleDuration) || ['inf', 'indefinido', '0'].includes(possibleDuration.toLowerCase())) {
                durationMinutes = possibleDuration;
                remainingArgs.shift();
                if (remainingArgs.length > 0) {
                    reason = remainingArgs.join(' ').trim();
                }
            } else {
                reason = remainingArgs.join(' ').trim();
            }
        }

        const targetNum = targetJid.split("@")[0].split(":")[0];
        const senderNum = sender.split("@")[0].split(":")[0];

        try {
            const res = muteService.muteUser({
                groupJid: from,
                userJid: targetJid,
                mutedBy: `@${senderNum}`,
                durationMinutes,
                reason
            });

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔇 *MEMBRO SILENCIADO* 🔇   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ DETALHES DA PUNIÇÃO 〕━⬣\n`;
            doc += `┃ 👤 *Infrator:* @${targetNum}\n`;
            doc += `┃ ⏱️ *Duração:* *${res.durationText}*\n`;
            doc += `┃ 📝 *Motivo:* ${res.reason}\n`;
            doc += `┃ 🛡️ *Aplicado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `🗑️ _Todas as mensagens enviadas pelo membro neste grupo serão apagadas automaticamente pelo bot._\n\n`;
            doc += `💡 _Para revogar a punição:_ \`${prefix}unmute @${targetNum}\`\n`;
            doc += `👑 *${botName}*`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [targetJid, sender]
            });
        } catch (err) {
            return reply("❌ *Erro ao silenciar membro:* " + err.message);
        }
    }
};
