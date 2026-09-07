/**
 * Comando .warn / .advertir / .aviso
 * Aplica advertência com contador, descrição de motivo e remoção automática ao atingir o limite
 */

const dataService = require('../../services/dataService');
const { getBotName } = require('../../config/botConfig');
const { renderCard } = require('../../utils/uiEngine');
const logger = require('../../core/logger');

module.exports = {
    name: 'warn',
    aliases: ['advertir', 'aviso', 'advertencia', 'adicionaraviso'],
    category: 'admin',
    description: 'Aplica advertência a um membro com motivo e expulsão ao atingir o limite do grupo',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ info, from, sender, isBotAdmin, client, reply, mentioned, args = [], prefix = '.' }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const warnLimit = configs[from].warnLimit || 3;
        const isStrict = Boolean(configs[from].strictModeration);

        const sub = (args?.[0] || "").toLowerCase().trim();
        const param = (args?.[1] || "").trim();

        // 1. Configuração de Limite (.warn limit <número>)
        if (sub === 'limit' || sub === 'limite' || sub === 'max') {
            const novoLimite = parseInt(param, 10);
            if (isNaN(novoLimite) || novoLimite < 1 || novoLimite > 20) {
                return reply(`❌ Informe um limite válido de advertências de 1 a 20 (ex: \`${prefix}warn limit 3\` ou \`${prefix}setwarnlimit 3\`).`);
            }

            configs[from].warnLimit = novoLimite;
            await dataService.saveConfigsData(configs);
            return reply(`✅ *LIMITE DE ADVERTÊNCIAS ATUALIZADO!*\n\n⚠️ O grupo agora expulsa membros automaticamente ao atingir *${novoLimite} advertências*.`);
        }

        // 2. Configuração de Moderação Estrita (.warn strict on/off)
        if (sub === 'strict' || sub === 'estrito' || sub === 'geral') {
            const enable = ['on', '1', 'ativar', 'sim'].includes(param.toLowerCase());
            const disable = ['off', '0', 'desativar', 'nao'].includes(param.toLowerCase());

            if (enable || disable) {
                configs[from].strictModeration = enable;
                await dataService.saveConfigsData(configs);
                return reply(`🛡️ *MODO ESTRITO DE ADVERTÊNCIAS:* ${enable ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"}\n\n${enable ? "⚠️ As regras e advertências agora se aplicam a TODOS os membros (inclusive administradores do grupo). Apenas os Donos do Bot continuam imunes." : "ℹ️ Administradores do grupo estão isentos de advertências automáticas."}`);
            }

            return reply(`💡 Use \`${prefix}warn strict on\` para aplicar regras a todos (inclusive admins) ou \`${prefix}warn strict off\`.`);
        }

        // 3. PREVIEW: Simulação de advertência
        if (sub === "preview" || sub === "teste" || sub === "test" || sub === "ver") {
            const senderNum = sender.split("@")[0].split(":")[0];

            const card = renderCard({
                title: "PREVIEW: ADVERTÊNCIA DE CONDUTA",
                icon: "⚠️",
                subtitle: `👤 *Membro Advertido:* @${senderNum}`,
                sections: [
                    {
                        title: "SITUAÇÃO DO INFRATOR",
                        icon: "📋",
                        fields: [
                            { label: "Total de Avisos", value: `⚠️ *2 / ${warnLimit} Advertências*`, icon: "🔢" },
                            { label: "Regra Violada", value: "Spam ou desrespeito às normas", icon: "📜" },
                            { label: "Modo Estrito", value: isStrict ? "🟢 Ativo (Todos)" : "⚪ Membros Comuns", icon: "🛡️" },
                            { label: "Próxima Infração", value: "🚫 *Expulsão Imediata (Kick)*", icon: "⚡" }
                        ]
                    }
                ],
                tip: `Ao atingir ${warnLimit} advertências, o membro é expulso automaticamente do grupo!`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        // 4. Aplicação de Advertência
        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        let warned = mentioned || quotedParticipant;

        // Se não tiver mention ou quote, tenta extrair número do primeiro argumento
        if (!warned && args.length > 0) {
            const candidate = args[0].replace(/[@\s]/g, "").replace(/\D/g, "");
            if (candidate.length >= 8) {
                warned = candidate + "@s.whatsapp.net";
            }
        }

        if (!warned) {
            let guide = `╔══════════════════════════════╗\n`;
            guide += `║   ⚠️ *SISTEMA DE ADVERTÊNCIAS* ⚠️   ║\n`;
            guide += `╚══════════════════════════════╝\n\n`;
            guide += `📌 *Limite Padrão do Grupo:* ${warnLimit} Advertências para Expulsão\n`;
            guide += `🛡️ *Modo Estrito:* ${isStrict ? "🟢 Ativo (Aplica a Admins)" : "⚪ Apenas Membros"}\n\n`;
            guide += `╭━〔 ⚙️ COMANDOS DISPONÍVEIS 〕━⬣\n`;
            guide += `┃ ➤ \`${prefix}warn @usuario [motivo]\` ➔ Advertir membro\n`;
            guide += `┃ ➤ \`${prefix}warn limit <n>\` ➔ Alterar limite (padrão 3)\n`;
            guide += `┃ ➤ \`${prefix}warn strict on/off\` ➔ Regra para admins\n`;
            guide += `┃ ➤ \`${prefix}limparavisos @usuario\` ➔ Zerar avisos do usuário\n`;
            guide += `┃ ➤ \`${prefix}limparavisos all\` ➔ Zerar avisos do grupo\n`;
            guide += `┃ ➤ \`${prefix}warnings @usuario\` ➔ Consultar advertências\n`;
            guide += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            guide += `👑 *${botName}*`;

            return reply(guide.trim());
        }

        // Extrai motivo personalizado ou utiliza padrão
        let reason = 'Conduta inadequada ou descumprimento das regras';
        const reasonParts = args.filter(a => !a.startsWith('@') && !a.includes('@s.whatsapp.net') && !/^\d{8,}$/.test(a));
        if (reasonParts.length > 0) {
            reason = reasonParts.join(' ').trim();
        }

        const warns = dataService.getWarnsData();
        warns[warned] = (warns[warned] || 0) + 1;
        const totalWarns = warns[warned];
        await dataService.saveWarnsData(warns);

        const targetNum = warned.split('@')[0].split(':')[0];
        const senderNum = sender.split('@')[0].split(':')[0];

        logger.info(`[WARN] Admin ${sender} advertiu ${warned} (${totalWarns}/${warnLimit}) por: ${reason}`);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚠️ *ADVERTÊNCIA DE CONDUTA* ⚠️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 📋 REGISTRO DE INFRAÇÃO 〕━⬣\n`;
        doc += `┃ 👤 *Membro Advertido:* @${targetNum}\n`;
        doc += `┃ ⚠️ *Avisos Acumulados:* *${totalWarns} / ${warnLimit}*\n`;
        doc += `┃ 📝 *Motivo:* ${reason}\n`;
        doc += `┃ 🛡️ *Aplicado por:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        if (totalWarns >= warnLimit) {
            if (isBotAdmin) {
                await client.groupParticipantsUpdate(from, [warned], 'remove');
                warns[warned] = 0;
                await dataService.saveWarnsData(warns);
                doc += `🚫 *EXPULSÃO EXECUTADA:* O usuário atingiu o limite máximo de ${warnLimit} advertências e foi removido do grupo.\n\n`;
            } else {
                doc += `⚠️ *Atenção:* O usuário atingiu o limite máximo de ${warnLimit} advertências. Promova o bot a admin para remoção automática imediata.\n\n`;
            }
        } else {
            const restantes = warnLimit - totalWarns;
            doc += `⚡ *Alerta:* Mais ${restantes} advertência(s) resultarão em *expulsão automática (Ban)*!\n\n`;
            doc += `💡 _Para consultar advertências ativas:_ \`${prefix}warnings @${targetNum}\`\n`;
        }

        doc += `👑 *${botName}*`;

        await client.sendMessage(from, {
            text: doc.trim(),
            mentions: [warned, sender]
        });
    }
};