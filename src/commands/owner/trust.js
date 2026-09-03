/**
 * Comando .trust
 * Gerencia a lista de usuários de confiança (TRUSTED)
 */

const { permissionRepo, ROLES } = require('../../services/permissionService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'trust',
    aliases: ['confiar', 'untrust', 'trusted'],
    category: 'owner',
    description: 'Adiciona ou remove usuários da lista de confiança (TRUSTED) do bot',
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ sender, args, reply, info }) => {
        const botName = getBotName();
        const sub = args[0]?.toLowerCase();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Admin";

        if (sub === 'list' || sub === 'lista') {
            const list = permissionRepo.getAllTrusted();
            if (list.length === 0) {
                return reply('ℹ️ Nenhum usuário está na lista de TRUSTED no momento.');
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🤝 *USUÁRIOS DE CONFIANÇA* 🤝   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📊 *Total Registrado:* ${list.length} usuários\n\n`;

            doc += `╭━〔 🎖️ MEMBROS TRUSTED 〕━⬣\n`;
            list.forEach((item, i) => {
                doc += `┃ ${i + 1}. @${item.jid.split('@')[0]}\n`;
                doc += `┃   └ 📝 *Notas:* ${item.notes || 'Sem observações'}\n`;
                doc += `┃   └ 🛡️ *Autor:* @${item.added_by.split('@')[0]}\n`;
            });
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            const mentions = list.map(item => item.jid);
            return reply(doc.trim(), mentions);
        }

        const isUntrust = sub === 'off' || sub === 'remover' || info.body?.startsWith('.untrust');
        const targetIndex = isUntrust ? 1 : 0;

        let targetJid = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!targetJid && args[targetIndex]) {
            const cleanNum = args[targetIndex].replace(/[@+\s-]/g, '');
            if (cleanNum.length >= 8) {
                targetJid = `${cleanNum}@s.whatsapp.net`;
            }
        }

        if (!targetJid) {
            return reply('❌ Informe o usuário alvo.\n\n📌 *Exemplos:*\n• `.trust @usuario Desenvolvedor sênior`\n• `.trust off @usuario`\n• `.trust list`');
        }

        const targetNum = targetJid.split('@')[0].split(':')[0];

        if (isUntrust) {
            permissionRepo.setTrusted(targetJid, false);
            permissionRepo.removeUserRole(targetJid);
            logger.info(`[TRUST] ${sender} removeu ${targetJid} da lista de confiança`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔻 *GERENCIAMENTO DE CARGOS* 🔻   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ HIERARQUIA DO BOT 〕━⬣\n`;
            doc += `┃ 👤 *Usuário:* @${targetNum}\n`;
            doc += `┃ 🔻 *Status:* *REMOVIDO DE TRUSTED (USER COMUM)*\n`;
            doc += `┃ 🛡️ *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para readicionar:_ \`.trust @${targetNum}\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [targetJid, sender]);
        }

        const notes = args.slice(1).join(' ') || 'Adicionado à lista de confiança';
        permissionRepo.setTrusted(targetJid, true, sender, notes);
        permissionRepo.setUserRole(targetJid, 'TRUSTED', sender);
        logger.info(`[TRUST] ${sender} adicionou ${targetJid} como TRUSTED`);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🤝 *GERENCIAMENTO DE CARGOS* 🤝   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ HIERARQUIA DO BOT 〕━⬣\n`;
        doc += `┃ 👤 *Usuário:* @${targetNum}\n`;
        doc += `┃ ⭐ *Cargo:* ⭐ *USUÁRIO DE CONFIANÇA (TRUSTED)*\n`;
        doc += `┃ 📝 *Notas:* ${notes}\n`;
        doc += `┃ 🛡️ *Promovido por:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Para remover:_ \`.trust off @${targetNum}\`\n`;
        doc += `👑 *${botName}*`;

        await reply(doc.trim(), [targetJid, sender]);
    }
};
