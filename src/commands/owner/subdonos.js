/**
 * Comando .subdonos / .listasubdonos
 * Lista todos os subdonos ativos (usuários com plano de aluguel do bot ativo)
 */

const rentalService = require('../../services/rentalService');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'subdonos',
    aliases: ['listasubdonos', 'subowners', 'alugueisbot'],
    category: 'owner',
    description: 'Lista todos os subdonos ativos com plano de aluguel do bot',
    ownerOnly: false,
    execute: async ({ client, from, reply, prefix = '.' }) => {
        const botName = getBotName();
        const subdonos = rentalService.getAllSubowners();

        if (!subdonos || subdonos.length === 0) {
            return reply(
                `👑 *CENTRAL DE SUBDONOS — ${botName}*\n\n` +
                `ℹ️ Nenhum subdono ativo no momento.\n\n` +
                `💡 Para alugar o bot e se tornar um subdono com acesso liberado no PV e comandos de gerência, utilize:\n` +
                `\`${prefix}aluguel planos\` ou \`${prefix}aluguel bot <@usuario> <dias>\``
            );
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   👑 *LISTA DE SUBDONOS ATIVOS* (${subdonos.length}) 👑   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `Membros que adquiriram o plano oficial de aluguel do bot (*Subdonos*):\n\n`;

        const mentions = [];

        subdonos.forEach((s, idx) => {
            const jid = s.targetJid || s.groupJid;
            const num = jid.split('@')[0].split(':')[0];
            mentions.push(jid);

            doc += `╭━〔 #${idx + 1} @${num} 〕━⬣\n`;
            doc += `┃ 🎖️ *Patente:* Subdono Temporário\n`;
            doc += `┃ ⏱️ *Tempo Restante:* ${s.remainingText}\n`;
            doc += `┃ 📅 *Expiração:* ${s.expiresAtFormatted}\n`;
            if (s.notes) doc += `┃ 📝 *Obs:* ${s.notes}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `💡 _Subdonos têm liberação exclusiva de PV e comandos de gestão do bot._\n`;
        doc += `👑 *${botName}*`;

        await client.sendMessage(from, {
            text: doc.trim(),
            mentions
        });
    }
};
