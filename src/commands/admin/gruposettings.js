/**
 * MeliodasBot — Comando .gruposettings / .modogrupo
 * Configura permissões do grupo (quem pode editar dados do grupo, aprovação de entrada, etc.)
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "gruposettings",
    aliases: ["gsetting", "modogrupo", "configgrupo", "gconfig", "travarinfo", "destravarinfo"],
    category: "admin",
    description: "Configura permissões do grupo (quem pode editar dados, aprovação de participantes)",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, args, reply, sender, commandName }) => {
        const botName = getBotName();
        const opt = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        // 1. Atalhos diretos .travarinfo / .destravarinfo
        if (commandName === "travarinfo" || (opt === "info" && (param === "admin" || param === "adm" || param === "lock" || param === "fechar"))) {
            try {
                await client.groupSettingUpdate(from, "locked");
                return reply(`🔒 *DADOS DO GRUPO TRAVADOS:*\nApenas administradores podem alterar o nome, foto e descrição do grupo.`);
            } catch (err) {
                return reply(`❌ Erro ao travar dados: ${err.message}`);
            }
        }

        if (commandName === "destravarinfo" || (opt === "info" && (param === "todos" || param === "all" || param === "unlock" || param === "abrir"))) {
            try {
                await client.groupSettingUpdate(from, "unlocked");
                return reply(`🔓 *DADOS DO GRUPO LIBERADOS:*\nTodos os participantes agora podem alterar o nome, foto e descrição do grupo.`);
            } catch (err) {
                return reply(`❌ Erro ao destravar dados: ${err.message}`);
            }
        }

        // 2. Aprovação de participantes (Join Approval Mode)
        if (opt === "aprovacao" || opt === "solicitacao" || opt === "pedidos") {
            const isEnable = ["on", "1", "ativar", "sim", "ligar"].includes(param);
            const isDisable = ["off", "0", "desativar", "nao", "desligar"].includes(param);

            if (!isEnable && !isDisable) {
                return reply(
                    "📌 *Uso:* `.gruposettings aprovacao <on/off>`\n\n" +
                    "• `.gruposettings aprovacao on` — Novos membros precisam de aprovação de admin para entrar\n" +
                    "• `.gruposettings aprovacao off` — Entrada livre no grupo via link"
                );
            }

            try {
                if (typeof client.groupJoinApprovalMode === "function") {
                    await client.groupJoinApprovalMode(from, isEnable ? "on" : "off");
                } else if (typeof client.groupSettingUpdate === "function") {
                    await client.groupSettingUpdate(from, isEnable ? "locked" : "unlocked");
                }
                return reply(`🛡️ *MODO DE APROVAÇÃO:* ${isEnable ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"}\n\n${isEnable ? "Novos participantes que usarem o link precisarão ser aceitos pelos administradores (.aceitar todos)." : "Novos participantes entram direto pelo link sem aprovação prévia."}`);
            } catch (err) {
                return reply(`❌ Erro ao atualizar modo de aprovação: ${err.message}`);
            }
        }

        // 3. Guia interativo de configurações do grupo
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║ ⚙️ *CONFIGURAÇÕES DO GRUPO* ⚙️ ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🛡️ FERRAMENTAS DISPONÍVEIS 〕━⬣\n`;
        doc += `┃ 📝 \`.setnomegrupo <nome>\` ➔ Alterar nome do grupo\n`;
        doc += `┃ 📜 \`.setdesc <texto>\` ➔ Alterar descrição / regras\n`;
        doc += `┃ 🖼️ \`.setfotogrupo\` ➔ Mudar foto do grupo (com foto)\n`;
        doc += `┃ 🔒 \`.gruposettings info admin\` ➔ Apenas Admins editam dados\n`;
        doc += `┃ 🔓 \`.gruposettings info todos\` ➔ Todos editam dados\n`;
        doc += `┃ 👥 \`.gruposettings aprovacao on/off\` ➔ Aprovação de entrada\n`;
        doc += `┃ 🔒 \`.fechargrupo [tempo]\` ➔ Apenas Admins mandam msg\n`;
        doc += `┃ 🔓 \`.abrirgrupo\` ➔ Todos mandam mensagens\n`;
        doc += `┃ 📋 \`.solicitacoes\` ➔ Listar pedidos de entrada\n`;
        doc += `┃ ✅ \`.aceitar todos\` ➔ Aprovar todos com delay seguro\n`;
        doc += `┃ ❌ \`.rejeitar todos\` ➔ Rejeitar todos os pedidos\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

