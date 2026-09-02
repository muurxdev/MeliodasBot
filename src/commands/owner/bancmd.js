/**
 * MeliodasBot — Comando .bancmd / .unbancmd
 * Permite que os Donos do bot suspendam ou reativem comandos globalmente
 * Suporta: por categoria (.bancmd rpg), por nome (.bancmd ytmp4) ou todos (.bancmd all)
 * Duração padrão: Indeterminada (permanente até o dono desbanir)
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

const VALID_CATEGORIES = [
    "rpg", "media", "economy", "dev", "rede", "admin", "fun", "general", "calc", "pesquisa", "interacao", "aluguel", "config"
];

module.exports = {
    name: "bancmd",
    aliases: ["banircomando", "unbancmd", "desbanircmd", "bloquearcmdglobal", "bancmdlist"],
    category: "owner",
    description: "Bane ou desbane comandos globalmente por categoria, por nome ou todos (.bancmd all)",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ sender, reply, args, isOwner, userRole, commandName }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        if (!isUserOwner) {
            return reply("❌ *Acesso Negado:* Este comando é restrito exclusivamente para os Donos do bot.");
        }

        const configs = dataService.getConfigsData();
        if (!configs["global"]) configs["global"] = {};
        if (!configs["global"].bannedCommands) configs["global"].bannedCommands = {};

        const bannedMap = configs["global"].bannedCommands;
        const isUnban = commandName === "unbancmd" || commandName === "desbanircmd" || args[0]?.toLowerCase() === "unban" || args[0]?.toLowerCase() === "remover";
        const botName = getBotName();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Dono";

        // 1. LISTAR COMANDOS E CATEGORIAS BANIDAS
        if (args.length === 0 || args[0]?.toLowerCase() === "list" || args[0]?.toLowerCase() === "listar") {
            const list = Object.entries(bannedMap);
            if (list.length === 0) {
                return reply(
                    "✅ *Nenhum comando ou categoria está banida globalmente no momento.*\n\n" +
                    "📌 *Como banir:*\n" +
                    "• `.bancmd <categoria>` — Ex: `.bancmd rpg` (Bane a categoria inteira)\n" +
                    "• `.bancmd <comando>` — Ex: `.bancmd ytmp4` (Bane o comando e aliases)\n" +
                    "• `.bancmd all` — Bane todos os comandos públicos\n\n" +
                    "💡 *Duração:* Indeterminada (permanente até você desbanir)."
                );
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🚫 *COMANDOS BANIDOS GLOBAL* 🚫   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📊 *Total Suspensos:* " + list.length + " registro(s)\n\n";

            doc += "╭━〔 🔒 LISTA DE RESTRIÇÕES ATIVAS 〕━⬣\n";
            list.forEach(([cName, info], idx) => {
                const isCat = VALID_CATEGORIES.includes(cName);
                const tag = cName === "all" ? " ⚠️ *(TODOS OS COMANDOS)*" : (isCat ? ` 📂 *(CATEGORIA COMPLETA: ${cName.toUpperCase()})*` : "");
                doc += `┃ ${idx + 1}. \`.${cName}\`${tag}\n`;
                doc += `┃   └ 📝 *Motivo:* ${info.reason || "Indeterminado"}\n`;
                doc += `┃   └ 📅 *Data:* ${info.date || "Recente"}\n`;
            });
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            doc += "💡 _Para desbanir:_ `.unbancmd <nome|categoria|all>`\n";
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        const target = (isUnban && args[0]?.toLowerCase() === "unban" ? args[1] : args[0])?.replace(/^[.!#\/]/, "").toLowerCase();
        if (!target) {
            return reply("❌ Informe o nome do comando, da categoria ou `all`.\n\n📌 *Exemplo:* `.bancmd rpg` ou `.bancmd all`");
        }

        // Protege comandos essenciais do Dono contra auto-banimento
        const immuneCommands = ["bancmd", "unbancmd", "dono", "setdono", "botopen", "botclose", "eval", "shutdown", "restart", "menu", "help"];
        if (immuneCommands.includes(target)) {
            return reply(`❌ O comando \`.${target}\` é vital para o controle do bot e não pode ser banido.`);
        }

        // 2. DESBANIR (ALL, CATEGORIA OU COMANDO INDIVIDUAL)
        if (isUnban) {
            if (target === "all" || target === "todos") {
                const count = Object.keys(bannedMap).length;
                configs["global"].bannedCommands = {};
                await dataService.saveConfigsData(configs);
                logger.info(`[BANCMD] Dono ${sender} desbaniu TODOS os comandos e categorias globalmente.`);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🔓 *TODOS OS COMANDOS REATIVADOS* 🔓   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ CONTROLE GLOBAL DE COMANDOS 〕━⬣\n`;
                doc += `┃ 🟢 *Estado:* *TODOS OS COMANDOS E CATEGORIAS LIVRES*\n`;
                doc += `┃ 📦 *Registros Limpos:* ${count}\n`;
                doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), sender ? [sender] : []);
            }

            if (!bannedMap[target]) {
                return reply(`⚠️ O comando ou categoria \`.${target}\` não está banida.`);
            }

            delete bannedMap[target];
            await dataService.saveConfigsData(configs);
            logger.info(`[BANCMD] Dono ${sender} desbaniu ${target}`);

            const isCat = VALID_CATEGORIES.includes(target);
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔓 *${isCat ? "CATEGORIA REATIVADA" : "COMANDO REATIVADO"}* 🔓   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE GLOBAL DE COMANDOS 〕━⬣\n`;
            doc += `┃ 🔓 *Alvo:* \`.${target}\`${isCat ? " (Todos os comandos da categoria)" : ""}\n`;
            doc += `┃ 🟢 *Estado:* *REATIVADO GLOBALMENTE*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        }

        // 3. BANIR (ALL, CATEGORIA OU COMANDO INDIVIDUAL)
        const reason = args.slice(1).join(" ").trim() || "Suspensão por tempo indeterminado pela administração";
        const date = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

        bannedMap[target] = {
            reason,
            by: sender.split("@")[0],
            date
        };

        await dataService.saveConfigsData(configs);
        logger.info(`[BANCMD] Dono ${sender} baniu ${target} (Motivo: ${reason})`);

        const isCat = VALID_CATEGORIES.includes(target);
        let res = `╔══════════════════════════════╗\n`;
        res += `║   🔒 *${target === "all" ? "TODOS OS COMANDOS BLOQUEADOS" : (isCat ? "CATEGORIA SUSPENSA GLOBAL" : "COMANDO SUSPENSO GLOBAL")}* 🔒   ║\n`;
        res += `╚══════════════════════════════╝\n\n`;
        res += `╭━〔 ⚙️ CONTROLE GLOBAL DE COMANDOS 〕━⬣\n`;
        res += `┃ 🔒 *Alvo:* \`.${target}\`${isCat ? " (Categoria Completa)" : (target === "all" ? " (Todos os Comandos Públicos)" : "")}\n`;
        res += `┃ 🔴 *Estado:* *BLOQUEADO INDETERMINADAMENTE*\n`;
        res += `┃ 📝 *Motivo:* ${reason}\n`;
        res += `┃ 👤 *Executado por:* @${senderNum}\n`;
        res += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        res += `💡 _Para reativar:_ \`.unbancmd ${target}\`\n`;
        res += `👑 *${botName}*`;

        return reply(res.trim(), sender ? [sender] : []);
    }
};
