/**
 * Comando .setcargo / .setpatente / .titulodono
 * Permite alterar dinamicamente o título/nome de exibição dos cargos da hierarquia de donos
 */

const { updateRankTitle, resetRankTitle, canModifyOwner, getOwnerRank, getOwners } = require("../../services/ownerService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "setcargo",
    aliases: ["setpatente", "titulodono", "nomearcargo", "customcargo", "resetcargo"],
    category: "owner",
    description: "Altera o título/nome de exibição oficial de uma patente de dono do bot",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ args, reply, sender, senderReal, roleJid }) => {
        const botName = getBotName();
        const candidates = [roleJid, senderReal, sender].filter(Boolean);
        const myRank = getOwnerRank(sender, candidates);

        if (!myRank) {
            return reply("⛔ *Acesso Negado:* Você não é um Dono cadastrado na hierarquia oficial.");
        }

        if (args.length < 1) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║   👑 *PERSONALIZAR CARGOS* 👑  ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• \`.setcargo <patente> <novo_titulo>\`\n";
            doc += "• \`.setcargo meucargo <novo_titulo>\`\n";
            doc += "• \`.setcargo reset <patente>\`\n\n";
            doc += "🎖️ *Patentes disponíveis:* Capitão, Tenente, Sargento, Cabo, Soldado\n\n";
            doc += "💡 *Exemplos:*\n";
            doc += "• \`.setcargo tenente Sub-Comandante do Purgatório\`\n";
            doc += "• \`.setcargo sargento Mestre das Sombras\`\n";
            doc += "• \`.setcargo meucargo General de Guerra\`\n\n";
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        let targetRank = args[0].toLowerCase();
        let newTitle = args.slice(1).join(" ").trim();

        // 1. Atalho "meucargo"
        if (targetRank === "meucargo" || targetRank === "meu" || targetRank === "meutitulo") {
            targetRank = myRank.rank.toLowerCase();
        }

        // 2. Modo Reset
        if (targetRank === "reset" || targetRank === "restaurar" || targetRank === "padrao") {
            const resetTarget = (args[1] || "").toLowerCase();
            if (!resetTarget) {
                return reply("❌ Informe qual patente deseja resetar para o padrão. Ex: `.setcargo reset tenente`");
            }
            const check = canModifyOwner(sender, resetTarget, candidates);
            if (!check.allowed && !(myRank.rank.toLowerCase() === resetTarget)) {
                return reply(check.reason);
            }
            const restored = resetRankTitle(resetTarget);
            if (!restored) return reply(`❌ Patente \`${resetTarget}\` não encontrada.`);
            return reply(`✅ *TÍTULO RESTAURADO!*\nA patente *${restored.rank}* voltou ao título padrão original.`);
        }

        // 3. Validação de Hierarquia
        const check = canModifyOwner(sender, targetRank, candidates);
        // Permite ao Tenente alterar o próprio título
        const isSelf = myRank.rank.toLowerCase() === targetRank;
        if (!check.allowed && !isSelf) {
            return reply(check.reason);
        }

        if (!newTitle) {
            return reply(`❌ Informe o novo título para o cargo *${targetRank.toUpperCase()}*.\nExemplo: \`.setcargo ${targetRank} General dos Pecados\``);
        }

        const updated = updateRankTitle(targetRank, newTitle);
        if (!updated) {
            return reply(`❌ Falha ao atualizar o cargo \`${targetRank}\`.`);
        }

        let res = "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n";
        res += "┃  👑 *TÍTULO DO CARGO ATUALIZADO!*  \n";
        res += "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n";
        res += `🎖️ *Patente Base:* ${updated.rank} (Nível ${updated.level})\n`;
        res += `✨ *Novo Título Oficial:* **${updated.customTitle}**\n`;
        res += `👤 *Titular Atual:* ${updated.name || "Vago"}\n`;
        res += `👑 *Alterado por:* ${myRank.customTitle || myRank.rank} (${myRank.name || sender.split("@")[0]})\n\n`;
        res += `💡 _Digite \`.donos\` para visualizar a hierarquia com o novo título!_`;

        return reply(res.trim());
    }
};

