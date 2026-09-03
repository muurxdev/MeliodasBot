const logger = require("../../core/logger");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "limparbot",
    aliases: ["clearbot", "apagarbot", "deletebot"],
    category: "admin",
    subcategory: "Moderação",
    description: "Apaga as últimas mensagens enviadas pelo bot no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 10000,
    execute: async ({ from, args, reply, sender, client, info }) => {
        const botName = getBotName();
        const senderNum = sender.split("@")[0].split(":")[0];
        let count = parseInt(args[0], 10);
        if (!count || count < 1) count = 10;
        if (count > 50) count = 50;

        try {
            const chatMessages = await client.store.loadMessages(from, count + 5);
            if (!chatMessages || chatMessages.length === 0) {
                return reply("❌ Não foi possível carregar as mensagens do grupo.");
            }

            const botJid = client.user?.id?.replace(/:.*@/, "@") || client.user?.id;
            const botMessages = chatMessages.filter(msg => {
                if (!msg.key || msg.key.fromMe !== true) return false;
                if (botJid && msg.key.remoteJid !== from) return false;
                return true;
            }).slice(0, count);

            if (botMessages.length === 0) {
                return reply("❌ Nenhuma mensagem do bot encontrada para apagar.");
            }

            let deleted = 0;
            for (const msg of botMessages) {
                try {
                    await client.sendMessage(from, { delete: msg.key });
                    deleted++;
                } catch (e) {
                    logger.warn(`[LIMPARBOT] Falha ao apagar mensagem: ${e.message}`);
                }
            }

            logger.info(`[LIMPARBOT] ${deleted} mensagens apagadas em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🧹 *LIMPEZA DO BOT* 🧹   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ RESULTADO 〕━⬣\n`;
            doc += `┃ 🧹 *Ação:* Mensagens do bot apagadas\n`;
            doc += `┃ 📊 *Removidas:* ${deleted}/${botMessages.length}\n`;
            doc += `┃ 👤 *Solicitado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        } catch (err) {
            logger.error("[LIMPARBOT ERROR]", err);
            return reply(`❌ *Erro ao limpar mensagens:* ${err.message}`);
        }
    }
};
