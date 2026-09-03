/**
 * Comando .cmd / .cmd all
 * Permite que administradores ativem/desativem comandos específicos no grupo
 * e permite aos Donos realizarem auditoria completa de comandos em grupos ou no privado (.cmd all)
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "cmd",
    aliases: ["togglecmd", "bloquearcmd", "desativarcmd", "ativarcmd", "cmdtoggle"],
    category: "admin",
    description: "Ativa/desativa comandos no grupo ou realiza auditoria completa de comandos (.cmd all)",
    adminOnly: true,
    groupOnly: false,
    cooldownMs: 2500,
    execute: async ({ args, from, reply, isOwner, userRole, isGroup, sender }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        const sub = (args[0] || "").toLowerCase();
        const botName = getBotName();

        // 1. AUDITORIA EXCLUSIVA DE DONOS: .cmd all / .cmd todos (sem on/off, funciona no PV e grupos)
        if ((sub === "all" || sub === "todos" || sub === "list" || sub === "listar") && !args[1] && (!isGroup || isUserOwner)) {
            if (!isUserOwner) {
                return reply("❌ *Acesso Negado:* O comando \`.cmd all\` para auditoria é restrito exclusivamente aos Donos do bot.");
            }

            const dispatcher = require("../../handlers/commandDispatcher");
            const allCmds = Array.from(dispatcher.getCommands().values());
            const allAliases = dispatcher.getAliases();

            // Agrupamento por Categoria
            const categories = {
                "rpg": { label: "⚔️ RPG & Aventura", cmds: [] },
                "economy": { label: "🎰 Economia & Cassino", cmds: [] },
                "media": { label: "📥 Mídias & Downloads", cmds: [] },
                "general": { label: "🧮 Geral, Calculadora & Horário", cmds: [] },
                "dev": { label: "👨‍💻 Dev Hub & Ferramentas", cmds: [] },
                "rede": { label: "🌐 Rede & Telemetria", cmds: [] },
                "admin": { label: "🛡️ Administração & Moderação", cmds: [] },
                "owner": { label: "👑 Donos & Servidor VPS", cmds: [] },
                "profile": { label: "👤 Perfil & Rankings", cmds: [] },
                "fun": { label: "🎲 Diversão & Tabuleiro", cmds: [] }
            };

            const roleGroups = {
                owner: [],
                admin: [],
                member: []
            };

            for (const cmd of allCmds) {
                const cat = cmd.category || "general";
                if (!categories[cat]) categories[cat] = { label: "📦 " + cat.toUpperCase(), cmds: [] };
                categories[cat].cmds.push(cmd.name);

                if (cmd.ownerOnly || cat === "owner") {
                    roleGroups.owner.push(cmd.name);
                } else if (cmd.adminOnly || cat === "admin") {
                    roleGroups.admin.push(cmd.name);
                } else {
                    roleGroups.member.push(cmd.name);
                }
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   👑 *AUDITORIA TOTAL DE COMANDOS* 👑 ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📊 *ESTATÍSTICAS GERAIS:*\n";
            doc += "📦 *Comandos Canônicos:* " + allCmds.length + "\n";
            doc += "🔀 *Aliases Registrados:* " + allAliases.size + "\n\n";

            doc += "╭━〔 📂 QUANTIDADE POR CATEGORIA 〕━⬣\n";
            for (const [key, data] of Object.entries(categories)) {
                if (data.cmds.length > 0) {
                    doc += "┃ " + data.label + ": *" + data.cmds.length + " comandos*\n";
                }
            }
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

            doc += `╭━〔 👑 DIVISÃO POR HIERARQUIA DE CARGO 〕━⬣\n`;
            doc += `👑 *EXCLUSIVOS PARA DONOS (Level 5):* ${roleGroups.owner.length} cmds\n`;
            doc += `${roleGroups.owner.map(c => `\`.${c}\``).join(', ')}\n\n`;

            doc += `🛡️ *EXCLUSIVOS PARA ADMINS (Level 3):* ${roleGroups.admin.length} cmds\n`;
            doc += `${roleGroups.admin.map(c => `\`.${c}\``).join(', ')}\n\n`;

            doc += `👤 *PÚBLICOS / MEMBROS GERAIS (Level 1-2):* ${roleGroups.member.length} cmds\n`;
            doc += `_Total de ${roleGroups.member.length} comandos livres para todos os participantes._\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        // Toggles de comando por grupo exigem ambiente de grupo
        if (!isGroup) {
            return reply("❌ A desativação de comandos só pode ser executada dentro de um grupo.\n\n💡 *No PV:* Use \`.cmd all\` para ver a auditoria de comandos.");
        }

        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        if (!Array.isArray(configs[from].disabledCommands)) {
            configs[from].disabledCommands = [];
        }

        const disabledList = configs[from].disabledCommands;

        if (args.length === 0) {
            if (disabledList.length === 0) {
                return reply("✅ *Todos os comandos estão ATIVOS* neste grupo no momento.\n\n💡 _Para desativar um comando:_ \`.cmd <nome_do_comando> off\`\n💡 _Para desativar todos:_ \`.cmd all off\`");
            }
            return reply("🔒 *Comandos Desativados neste Grupo (" + disabledList.length + "):*\n\n" + disabledList.map(c => "• \`." + c + "\`").join("\n") + "\n\n💡 _Para reativar:_ \`.cmd <nome_do_comando> on\` ou \`.cmd all on\`");
        }

        const targetCmd = args[0].replace(/^[.!#\/]/, "").toLowerCase();
        const action = args[1]?.toLowerCase();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Admin";

        // Caso especial: .cmd all off / .cmd all on no grupo
        if (targetCmd === "all" || targetCmd === "todos") {
            if (action === "off" || action === "desativar") {
                if (!disabledList.includes("all")) {
                    disabledList.push("all");
                }
                await dataService.saveConfigsData(configs);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🛡️ *MODERAÇÃO DO GRUPO* 🛡️   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
                doc += `┃ 🛡️ *Escopo:* *TODOS OS COMANDOS PÚBLICOS*\n`;
                doc += `┃ 🔴 *Estado:* *DESATIVADOS NO GRUPO*\n`;
                doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Apenas Administradores do grupo e Donos do bot podem utilizar comandos._\n`;
                doc += `💡 _Para reativar todos os comandos:_ \`.cmd all on\`\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), sender ? [sender] : []);
            } else {
                configs[from].disabledCommands = [];
                await dataService.saveConfigsData(configs);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🛡️ *MODERAÇÃO DO GRUPO* 🛡️   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
                doc += `┃ 🛡️ *Escopo:* *TODOS OS COMANDOS DO GRUPO*\n`;
                doc += `┃ 🟢 *Estado:* *REATIVADOS E LIVRES*\n`;
                doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), sender ? [sender] : []);
            }
        }

        // Protege comandos vitais de administração contra desativação
        const protectedCommands = ["cmd", "adm", "setprefix", "fechargrupo", "abrirgrupo", "menu", "help"];
        if (protectedCommands.includes(targetCmd)) {
            return reply("❌ O comando \`." + targetCmd + "\` é essencial e não pode ser desativado.");
        }

        const isCurrentlyDisabled = disabledList.includes(targetCmd);

        if (action === "off" || action === "desativar" || (!action && !isCurrentlyDisabled)) {
            if (!isCurrentlyDisabled) {
                disabledList.push(targetCmd);
            }
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Comando:* \`.${targetCmd}\`\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO NO GRUPO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar este comando:_ \`.cmd ${targetCmd} on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        } else {
            const index = disabledList.indexOf(targetCmd);
            if (index !== -1) {
                disabledList.splice(index, 1);
            }
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Comando:* \`.${targetCmd}\`\n`;
            doc += `┃ 🟢 *Estado:* *REATIVADO NO GRUPO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar este comando:_ \`.cmd ${targetCmd} off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        }
    }
};
