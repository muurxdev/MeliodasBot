/**
 * MeliodasBot — Comando .setdono / .adddono
 * Nomeia ou altera Donos seguindo a hierarquia militar rígida
 * Suporta menção (@user), resolução profunda de LID para número real, nome do perfil e quem nomeou
 */

const { updateOwner, canModifyOwner } = require("../../services/ownerService");
const dataService = require("../../services/dataService");
const groupAuthService = require("../../services/groupAuthService");
const { getDatabase } = require("../../database/connection");
const { formatPhoneFromJid } = require("../../config/env");

module.exports = {
    name: "setdono",
    aliases: ["setowner", "adddono", "mudardono", "nomearpatente"],
    category: "owner",
    description: "Nomeia ou altera um Dono seguindo a hierarquia militar rígida",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ args, reply, sender, senderReal, roleJid, mentionedJid, client }) => {
        if (args.length < 2) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║   👑 *GESTÃO DE PATENTES* 👑   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• \`.setdono <patente> @usuario\`\n";
            doc += "• \`.setdono <patente> <nome>\`\n";
            doc += "• \`.setdono <patente> <nome> | <telefone>\`\n\n";
            doc += "🎖️ *Patentes:* Capitão, Tenente, Sargento, Cabo, Soldado\n\n";
            doc += "🛡️ *Regras de Hierarquia:*\n";
            doc += "• 👑 *Capitão:* Altera e nomeia todos os cargos.\n";
            doc += "• 🎖️ *Tenente:* Altera patentes abaixo dele (Sargento, Cabo, Soldado).\n";
            doc += "• 🚫 *Imunidade:* Ninguém tem permissão de alterar o Capitão.";
            return reply(doc.trim());
        }

        const cargo = args[0].toLowerCase();
        const candidates = [roleJid, senderReal, sender].filter(Boolean);
        const check = canModifyOwner(sender, cargo, candidates);

        if (!check.allowed) {
            return reply(check.reason);
        }

        const fullInput = args.slice(1).join(" ").trim();
        let nome = "";
        let phoneFormatted = "";
        let targetJid = "";

        // 1. TRATAMENTO DE MENÇÃO DIRETA (@user)
        if (Array.isArray(mentionedJid) && mentionedJid.length > 0) {
            const rawMention = mentionedJid[0];
            targetJid = rawMention;

            // Tenta resolver o JID real se for LID
            let resolvedJid = await groupAuthService.resolveRealJid(client, rawMention);
            let userDb = null;

            try {
                const db = getDatabase();
                userDb = db.prepare("SELECT name, phone, jid, lid FROM users WHERE lid = ? OR jid = ?").get(rawMention, rawMention);
            } catch (_) {}

            const xpData = dataService.getXpData();
            const xpUser = xpData[rawMention] || (resolvedJid ? xpData[resolvedJid] : null);

            // Nome do usuário
            const rawMentionClean = fullInput.replace(/^@+/, "").trim();
            nome = userDb?.name || xpUser?.name || rawMentionClean || "Guerreiro";

            // Número de telefone real
            const realPhoneDigits = userDb?.phone || (resolvedJid && !resolvedJid.endsWith("@lid") ? resolvedJid.split("@")[0] : "");
            if (realPhoneDigits) {
                targetJid = realPhoneDigits.replace(/\D/g, "") + "@s.whatsapp.net";
                phoneFormatted = formatPhoneFromJid(targetJid);
            } else if (!rawMention.endsWith("@lid")) {
                phoneFormatted = formatPhoneFromJid(rawMention);
            } else {
                phoneFormatted = "+" + rawMention.split("@")[0];
            }
        }
        // 2. TRATAMENTO COM PIPE (Nome | Telefone)
        else if (fullInput.includes("|")) {
            const parts = fullInput.split("|");
            nome = parts[0].trim();
            const phonePart = parts[1].trim();
            const rawDigits = phonePart.replace(/\D/g, "");
            targetJid = rawDigits + "@s.whatsapp.net";
            phoneFormatted = formatPhoneFromJid(targetJid);
        }
        // 3. TELEFONE DIRETO
        else if (/^\+?\d{9,}$/.test(fullInput.replace(/\s+/g, ""))) {
            const raw = fullInput.replace(/\D/g, "");
            targetJid = raw + "@s.whatsapp.net";
            phoneFormatted = formatPhoneFromJid(targetJid);
            nome = `Dono ${raw.slice(-4)}`;
        }
        // 4. APENAS NOME
        else {
            nome = fullInput;
        }

        if (!nome) {
            return reply("❌ Informe o nome ou marque o usuário (@) para registrar a patente.");
        }

        const appointedByText = check.senderRank?.name
            ? `${check.senderRank.rank} (${check.senderRank.name})`
            : (check.senderRank?.rank || "Dono");

        const updated = updateOwner(cargo, nome, phoneFormatted, targetJid, appointedByText);
        if (!updated) {
            return reply(`❌ Falha ao atualizar a patente \`${cargo}\`.`);
        }

        const mentions = [];
        if (targetJid) mentions.push(targetJid);
        if (sender) mentions.push(sender);

        let res = "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n";
        res += "┃  👑 *PATENTE DE DONO ATUALIZADA!*  \n";
        res += "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n";
        res += `🎖️ *Patente:* **${updated.rank}** (Nível ${updated.level})\n`;
        res += `👤 *Nome Registrado:* @${(updated.jid || targetJid || sender).split("@")[0]} (${updated.name})\n`;
        res += `📱 *WhatsApp/Contato:* ${updated.phone || "Manter atual"}\n`;
        res += `🟢 *Nomeado por:* ${appointedByText}\n`;
        res += `📅 *Data:* ${updated.appointedAt || "Hoje"}`;

        return reply(res.trim(), mentions);
    }
};
