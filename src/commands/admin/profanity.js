const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

const PROFANITY_LIST = [
    "porra", "caralho", "puta", "merda", "foda", "fodase", "fodasse",
    "buceta", "arrombado", "arrombada", "cuzao", "cuzão", "piranha",
    "vagabundo", "vagabunda", "desgraçado", "desgraçada", "otario",
    "otário", "idiota", "imbecil", "filho da puta", "fdp",
    "cornudo", "cornuda", "bosta", "viado", "viada"
];

module.exports = {
    name: "profanity",
    aliases: ["palavrao", "palavroes", "antipalavrao", "swear"],
    category: "admin",
    subcategory: "Moderação",
    description: "Ativa ou desativa o filtro de palavrões no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim") {
            configs[from].antiProfanity = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[PROFANITY] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🚫 *FILTRO DE PALAVRÕES* 🚫   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🚫 *Recurso:* Filtro de Palavrões\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 📊 *Lista:* ${PROFANITY_LIST.length} palavras bloqueadas\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.profanity off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "nao") {
            configs[from].antiProfanity = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[PROFANITY] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🚫 *FILTRO DE PALAVRÕES* 🚫   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🚫 *Recurso:* Filtro de Palavrões\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar:_ \`.profanity on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "lista" || opt === "list" || opt === "ver") {
            let doc = `📜 *LISTA DE PALAVRÕES BLOQUEADOS:*\n\n`;
            doc += PROFANITY_LIST.map((w, i) => `${i + 1}. ||${w}||`).join("\n");
            doc += `\n\n📊 *Total:* ${PROFANITY_LIST.length} palavras`;
            return reply(doc.trim());
        }

        const isEnabled = Boolean(configs[from].antiProfanity);
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🚫 *FILTRO DE PALAVRÕES* 🚫   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🚫 *Recurso:* Filtro de Palavrões\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📊 *Lista:* ${PROFANITY_LIST.length} palavras bloqueadas\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.profanity on\` — Ativar filtro\n`;
        doc += `• \`.profanity off\` — Desativar filtro\n`;
        doc += `• \`.profanity lista\` — Ver lista bloqueada\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
