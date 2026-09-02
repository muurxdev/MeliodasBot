/**
 * MeliodasBot — Comando .solicitacoes / .aceitar / .rejeitar
 * Gerenciamento seguro de solicitações de entrada no grupo com throttling anti-ban
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "solicitacoes",
    aliases: ["joinrequests", "pedidos", "pendentes", "aceitar", "aprovar", "rejeitar", "recusar"],
    category: "admin",
    description: "Lista, aceita ou rejeita solicitações de entrada no grupo com intervalo seguro",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, sender, reply, args, commandName, isOwner, isAdmin }) => {
        const botName = getBotName();
        const cmd = (commandName || "solicitacoes").toLowerCase();
        const sub = (args[0] || "").toLowerCase();

        // 1. Obter lista de solicitações pendentes via Baileys
        let requests = [];
        try {
            if (typeof client.groupRequestParticipantsList === "function") {
                requests = await client.groupRequestParticipantsList(from) || [];
            } else {
                return reply("❌ *Aviso:* A biblioteca do WhatsApp não suporta leitura de solicitações nesta versão.");
            }
        } catch (err) {
            logger.error("[SOLICITACOES ERROR]", err);
            return reply(`❌ *Erro ao consultar solicitações:* ${err.message}\n\n💡 Verifique se o modo de aprovação de participantes está ativo no grupo e se o bot é Administrador.`);
        }

        const isActionAccept = ["aceitar", "aprovar"].includes(cmd) || ["aceitar", "aprovar", "sim"].includes(sub);
        const isActionReject = ["rejeitar", "recusar"].includes(cmd) || ["rejeitar", "recusar", "nao"].includes(sub);

        // CASO A: LISTAR SOLICITAÇÕES
        if (!isActionAccept && !isActionReject && (!sub || sub === "list" || sub === "listar" || sub === "ver")) {
            if (requests.length === 0) {
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   📋 *SOLICITAÇÕES DE ENTRADA* 📋   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `✅ *Nenhuma solicitação pendente no momento.*\n\n`;
                doc += `💡 _Quando novos membros solicitarem entrada com a aprovação ligada, eles aparecerão aqui._\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim());
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📋 *SOLICITAÇÕES PENDENTES* 📋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📊 *Total de Pedidos:* ${requests.length} participante(s)\n\n`;
            doc += `╭━〔 👥 USUÁRIOS AGUARDANDO 〕━⬣\n`;

            const mentions = [];
            requests.slice(0, 25).forEach((req, i) => {
                const jid = req.jid || req.id || String(req);
                const num = jid.split("@")[0].split(":")[0];
                mentions.push(jid);
                doc += `┃ ${i + 1}. @${num}\n`;
                if (req.request_time) {
                    const dateStr = new Date(Number(req.request_time) * 1000).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
                    doc += `┃    └ ⏱️ _Pedido feito às ${dateStr}_\n`;
                }
            });

            if (requests.length > 25) {
                doc += `┃ ... e mais ${requests.length - 25} usuário(s)\n`;
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Ações Rápidas:*\n`;
            doc += `• \`.aceitar todos\` — Aceitar todos com intervalo seguro anti-ban (5 a 10s)\n`;
            doc += `• \`.aceitar @usuario\` — Aceitar participante específico\n`;
            doc += `• \`.rejeitar todos\` — Rejeitar todos os pedidos\n`;
            doc += `• \`.rejeitar @usuario\` — Rejeitar participante específico\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), mentions);
        }

        // Determina a ação ('approve' ou 'reject')
        const actionType = isActionAccept ? "approve" : "reject";
        const actionLabel = isActionAccept ? "Aprovado(s)" : "Rejeitado(s)";
        const actionVerb = isActionAccept ? "Aprovando" : "Rejeitando";

        // CASO B: PROCESSAR TODOS OS PEDIDOS (COM INTERVALO SEGURO / THROTTLING ANTI-BAN)
        const isAll = (args[0]?.toLowerCase() === "todos" || args[0]?.toLowerCase() === "all" || args[1]?.toLowerCase() === "todos" || args[1]?.toLowerCase() === "all");

        if (isAll) {
            if (requests.length === 0) {
                return reply(`⚠️ Não há solicitações pendentes para ${actionType === "approve" ? "aprovar" : "rejeitar"}.`);
            }

            // Intervalo customizável em segundos (padrão: 5s por participante para segurança)
            let delaySec = 5;
            const parsedDelay = parseInt(args.find(a => /^\d+s?$/i.test(a)));
            if (parsedDelay && parsedDelay >= 2 && parsedDelay <= 30) {
                delaySec = parsedDelay;
            }

            const total = requests.length;
            const totalEstimatedSec = total * delaySec;

            let startMsg = `╔══════════════════════════════╗\n`;
            startMsg += `║   🛡️ *PROCESSANDO SOLICITAÇÕES* 🛡️   ║\n`;
            startMsg += `╚══════════════════════════════╝\n\n`;
            startMsg += `⏳ *${actionVerb} ${total} participante(s) em lote...*\n`;
            startMsg += `⏱️ *Intervalo de Segurança:* ${delaySec}s por usuário (Anti-Ban)\n`;
            startMsg += `⏳ *Tempo Estimado:* ~${totalEstimatedSec} segundos\n\n`;
            startMsg += `💡 _O bot está processando em segundo plano de forma segura._\n`;
            startMsg += `👑 *${botName}*`;

            await reply(startMsg.trim());

            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < requests.length; i++) {
                const req = requests[i];
                const jid = req.jid || req.id || String(req);

                try {
                    await client.groupRequestParticipantsUpdate(from, [jid], actionType);
                    successCount++;
                } catch (procErr) {
                    logger.warn(`[GROUP_REQUEST_UPDATE WARN] Falha ao processar ${jid}: ${procErr.message}`);
                    failCount++;
                }

                // Aguarda o intervalo de segurança entre cada aprovação (exceto no último)
                if (i < requests.length - 1) {
                    await new Promise(r => setTimeout(r, delaySec * 1000));
                }
            }

            let endDoc = `╔══════════════════════════════╗\n`;
            endDoc += `║   ✅ *PROCESSO FINALIZADO* ✅   ║\n`;
            endDoc += `╚══════════════════════════════╝\n\n`;
            endDoc += `╭━〔 📊 RESULTADO DO LOTE 〕━⬣\n`;
            endDoc += `┃ 👥 *Total Processado:* ${total}\n`;
            endDoc += `┃ 🟢 *${actionLabel} com Sucesso:* ${successCount}\n`;
            if (failCount > 0) {
                endDoc += `┃ 🔴 *Falhas:* ${failCount}\n`;
            }
            endDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            endDoc += `👑 *${botName}*`;

            return reply(endDoc.trim());
        }

        // CASO C: PROCESSAR USUÁRIO ESPECÍFICO (POR MENÇÃO OU NÚMERO)
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
        const mentionedJid = contextInfo?.mentionedJid?.[0];
        let targetJid = mentionedJid;

        if (!targetJid) {
            const rawTarget = args.find(a => !["aceitar", "aprovar", "rejeitar", "recusar", "todos", "all"].includes(a.toLowerCase()));
            if (rawTarget) {
                const cleanNum = rawTarget.replace(/[^0-9]/g, "");
                if (cleanNum.length >= 8) {
                    targetJid = `${cleanNum}@s.whatsapp.net`;
                }
            }
        }

        if (!targetJid) {
            return reply(
                `❌ *Informe quem deseja ${actionType === "approve" ? "aceitar" : "rejeitar"}!*\n\n` +
                `📌 *Exemplos:*\n` +
                `• \`.${cmd} todos\` — Processar todas as solicitações\n` +
                `• \`.${cmd} @usuario\` — Processar o usuário mencionado\n` +
                `• \`.${cmd} 5511999999999\` — Processar por número de telefone`
            );
        }

        // Procura se o targetJid está na lista de pedidos
        const found = requests.find(r => (r.jid || r.id || String(r)).includes(targetJid.split("@")[0]));
        const finalJid = found ? (found.jid || found.id || String(found)) : targetJid;

        try {
            await client.groupRequestParticipantsUpdate(from, [finalJid], actionType);
            const userNum = finalJid.split("@")[0].split(":")[0];
            return reply(`✅ *Participante @${userNum} ${actionLabel.toLowerCase()} com sucesso!*`, [finalJid]);
        } catch (err) {
            logger.error("[GROUP REQUEST SINGLE ERROR]", err);
            return reply(`❌ *Falha ao ${actionType === "approve" ? "aceitar" : "rejeitar"} participante:* ${err.message}`);
        }
    }
};

