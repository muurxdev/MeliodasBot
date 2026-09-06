/**
 * Comando .deldono / .delcargo / .delowner / .removerdono / .removercargo
 * Remove ou desativa um Dono da hierarquia militar seguindo autorização rígida:
 * • Suporta: Menção (@user), Resposta à mensagem (quoted), Telefone, Patente ou Nick do bot
 * • Resolução profunda do perfil do usuário: Nome cadastrado no bot via .login (displayNick), WhatsApp pushName e nome no cargo
 * • Marcação ativa no WhatsApp (@user)
 * • Limpeza completa no SQLite (ownerService, user_roles, trust_list)
 */

const {
    getOwners,
    findOwnerByQuery,
    canModifyOwner,
    demoteOwnerComplete,
    resolveOwnerProfileDetails,
    resolveOwnerName,
    getOwnerRank
} = require("../../services/ownerService");
const groupAuthService = require("../../services/groupAuthService");
const { formatPhoneFromJid } = require("../../config/env");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "deldono",
    aliases: [
        "delowner",
        "removerdono",
        "rebaixardono",
        "removedono",
        "tirardono",
        "delcargo",
        "removercargo",
        "tirarcargo",
        "desnomeardono"
    ],
    category: "owner",
    description: "Remove um Dono ou revoga cargo da hierarquia militar exibindo o perfil completo e marcando o usuário",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({
        args,
        reply,
        sender,
        senderReal,
        roleJid,
        mentionedJid,
        info,
        from,
        isGroup,
        client,
        prefix = "."
    }) => {
        const botName = getBotName();
        const candidates = [roleJid, senderReal, sender].filter(Boolean);
        const senderRank = getOwnerRank(sender, candidates);

        // 1. Validação de Autoridade do Remetente
        if (!senderRank || senderRank.level < 4) {
            return reply(
                "⛔ *Acesso Negado:* Apenas o *Capitão* e o *Tenente* têm autoridade para remover Donos ou revogar cargos na hierarquia militar oficial."
            );
        }

        // 2. Extração do Alvo (Menção @, Resposta ou Texto)
        let targetRaw = null;

        if (Array.isArray(mentionedJid) && mentionedJid.length > 0) {
            targetRaw = mentionedJid[0];
        } else if (info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetRaw = info.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (info?.message?.extendedTextMessage?.contextInfo?.participant) {
            targetRaw = info.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            targetRaw = args.join(" ").trim();
        }

        // 3. Guia de Ajuda caso nenhum alvo seja especificado
        if (!targetRaw) {
            const owners = getOwners();
            const activeOwners = owners.filter(o => o.active);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   👑 *REMOÇÃO DE DONOS & CARGOS* 👑   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += `• \`${prefix}deldono @usuario\` (Mencione o dono a ser removido)\n`;
            doc += `• Responder à mensagem do dono com \`${prefix}deldono\`\n`;
            doc += `• \`${prefix}deldono <patente>\` (Ex: \`${prefix}deldono soldado\` ou \`${prefix}deldono cabo\`)\n`;
            doc += `• \`${prefix}deldono <telefone>\` (Ex: \`${prefix}deldono 551199999999\`)\n`;
            doc += `• \`${prefix}deldono <nick_no_bot>\` (Ex: \`${prefix}deldono Meliodas\`)\n\n`;
            doc += "🛡️ *Regras de Hierarquia Militar:*\n";
            doc += "• 👑 *Capitão (Nível 5):* Autoridade Suprema. Remove qualquer cargo ou dono da hierarquia.\n";
            doc += "• 🎖️ *Tenente (Nível 4):* Gerencia e remove patentes abaixo dele (Sargento, Cabo, Soldado, etc.).\n";
            doc += "• 🚫 *Imunidade Máxima:* Ninguém possui permissão para remover ou rebaixar o Capitão.\n\n";

            if (activeOwners.length > 0) {
                doc += "╭━〔 📋 DONOS ATIVOS NA HIERARQUIA 〕━⬣\n";
                for (const o of activeOwners) {
                    const title = o.customTitle ? `${o.customTitle} (${o.rank})` : o.rank;
                    const liveNick = resolveOwnerName(o);
                    doc += `┃ 🎖️ *${title}:* ${liveNick || "Dono"} ${o.phone ? `(${o.phone})` : ""}\n`;
                }
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            }

            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        // 4. Localização do Alvo na Hierarquia Militar
        let targetOwner = null;
        let resolvedJid = null;

        if (targetRaw.includes("@")) {
            try {
                if (groupAuthService && typeof groupAuthService.resolveRealJid === "function") {
                    resolvedJid = await groupAuthService.resolveRealJid(client, targetRaw);
                }
            } catch (_) {}
            targetOwner = findOwnerByQuery(targetRaw, [targetRaw, resolvedJid]);
            if (!targetOwner && resolvedJid) {
                targetOwner = findOwnerByQuery(resolvedJid, [targetRaw, resolvedJid]);
            }
        } else {
            targetOwner = findOwnerByQuery(targetRaw);
        }

        // 5. Tratamento de Alvo Não Encontrado
        if (!targetOwner) {
            // Caso seja no grupo e o comando foi invocado como delcargo/removercargo, checa cargo de grupo
            if (isGroup && (targetRaw.includes("@") || resolvedJid)) {
                const targetUserJid = resolvedJid || targetRaw;
                try {
                    const userRepo = require("../../database/repositories/userRepository");
                    const userDb = userRepo.getUser(targetUserJid);
                    if (userDb && userDb.cargos && userDb.cargos[from]) {
                        const oldCargo = userDb.cargos[from];
                        delete userDb.cargos[from];
                        userRepo.saveUser(userDb);
                        const targetDigits = targetUserJid.split("@")[0].replace(/\D/g, "");
                        const senderDigits = sender.split("@")[0].replace(/\D/g, "");
                        return reply(
                            `✅ *CARGO DE GRUPO REMOVIDO!*\n\n` +
                            `👤 *Usuário:* @${targetDigits} (${userDb.displayNick || userDb.name || "Membro"})\n` +
                            `🎖️ *Cargo Revogado:* ${oldCargo}\n` +
                            `⚖️ *Revogado por:* @${senderDigits}`,
                            [targetUserJid, sender]
                        );
                    }
                } catch (_) {}
            }

            return reply(
                `❌ Dono ou patente \`${targetRaw}\` não foi localizado na hierarquia militar oficial do bot.\n\n` +
                `💡 *Dica:* Digite \`${prefix}dono\` para visualizar a lista de donos ativos ou mencione o usuário (@dono).`
            );
        }

        // 6. Verificação de Slot Já Desocupado
        if (!targetOwner.active) {
            return reply(
                `ℹ️ O cargo/patente *${targetOwner.rank}* já se encontra vago e desocupado na hierarquia oficial.\n\n` +
                `💡 _Para nomear um novo titular: \`${prefix}setdono ${targetOwner.rank.toLowerCase()} @usuario\`_`
            );
        }

        // 7. Validação Rígida da Hierarquia Militar
        const check = canModifyOwner(sender, targetOwner, candidates);
        if (!check.allowed) {
            return reply(check.reason);
        }

        // 8. Resolução Profunda do Perfil do Alvo no Bot (SQLite + WhatsApp)
        const profile = resolveOwnerProfileDetails(targetOwner, [targetRaw, resolvedJid].filter(Boolean));
        const targetJid = profile.jid || targetOwner.jid || (targetRaw.includes("@") ? targetRaw : null);

        // 9. Execução da Desvinculação Completa (Hierarquia + Permissões)
        const removed = demoteOwnerComplete(targetOwner, senderRank, sender);
        if (!removed) {
            return reply(`❌ Falha ao desocupar a patente \`${targetOwner.rank}\`.`);
        }

        // 10. Limpeza adicional no perfil do usuário no SQLite
        if (targetJid) {
            try {
                const userRepo = require("../../database/repositories/userRepository");
                const u = userRepo.getUser(targetJid);
                if (u && u.cargos && typeof u.cargos === "object") {
                    delete u.cargos["global"];
                    delete u.cargos["owner"];
                    userRepo.saveUser(u);
                }
            } catch (_) {}
        }

        // 11. Formatação Visual da Resposta com Menção Ativa (@user) e Detalhes Reais
        const targetDigits = (targetJid || "").replace(/\D/g, "");
        const targetTag = targetDigits ? `@${targetDigits}` : `@${(profile.phone || "").replace(/\D/g, "") || "membro"}`;
        const senderDigits = (sender || "").replace(/\D/g, "");
        const senderTag = senderDigits ? `@${senderDigits}` : `@${(senderRank.phone || "").replace(/\D/g, "") || "comandante"}`;

        const phoneFormatted = profile.phone || (targetJid ? formatPhoneFromJid(targetJid) : "Não informado");
        const displayNickFormatted = profile.displayNick ? `*${profile.displayNick}*` : "_(Não configurado via .login)_";
        const pushNameFormatted = profile.pushName || "Desconhecido";
        const ownerNameFormatted = profile.ownerName || targetOwner.name || "Não registrado";
        const customTitleFormatted = removed.customTitle || removed.rank;
        const appointedByFormatted = removed.appointedBy || "Comando Superior";
        const senderRankTitle = senderRank.customTitle ? `${senderRank.customTitle} (${senderRank.rank})` : senderRank.rank;

        const mentions = [];
        if (targetJid) mentions.push(targetJid);
        if (sender) mentions.push(sender);

        let res = "╔══════════════════════════════╗\n";
        res += "║   👑 *CARGO DE DONO REVOGADO* 👑   ║\n";
        res += "╚══════════════════════════════╝\n\n";

        res += "╭━〔 👤 PERFIL DO MEMBRO DESVINCULADO 〕━⬣\n";
        res += `┃ 🎯 *Usuário Marcado:* ${targetTag}\n`;
        res += `┃ 🏷️ *Nome no Perfil do Bot:* ${displayNickFormatted}\n`;
        res += `┃ 💬 *Nome no WhatsApp:* ${pushNameFormatted}\n`;
        res += `┃ 👑 *Nome Registrado no Cargo:* ${ownerNameFormatted}\n`;
        res += `┃ 📱 *WhatsApp/Contato:* ${phoneFormatted}\n`;
        res += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        res += "╭━〔 🎖️ HIERARQUIA & PATENTE REVOGADA 〕━⬣\n";
        res += `┃ 🆔 *Patente:* **${removed.rank}** (Nível ${removed.level})\n`;
        res += `┃ ✨ *Título Oficial:* ${customTitleFormatted}\n`;
        res += `┃ 🟢 *Originalmente Nomeado por:* ${appointedByFormatted}\n`;
        res += `┃ ⚖️ *Revogado por:* ${senderTag} (${senderRankTitle})\n`;
        res += `┃ 📅 *Data da Revogação:* ${new Date().toLocaleDateString("pt-BR")}\n`;
        res += "┃ 📌 *Status da Vaga:* Vaga desocupada e liberada na hierarquia oficial\n";
        res += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        res += `💡 _Para nomear um novo titular para a patente *${removed.rank}*:_\n`;
        res += `\`${prefix}setdono ${removed.rank.toLowerCase()} @usuario\``;

        return reply(res.trim(), mentions);
    }
};
