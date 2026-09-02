/**
 * MeliodasBot — Comando .setmenuname / .menuname
 * Permite que os Donos alterem os títulos e cabeçalhos dos menus do bot
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "setmenuname",
    aliases: ["menuname", "titulomenu", "nomedomenu", "alterarmenu"],
    category: "owner",
    description: "Altera o título ou nome exibido nos cabeçalhos dos menus do bot",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args, isOwner, userRole, sender }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        if (!isUserOwner) {
            return reply("❌ *Acesso Negado:* Este comando é exclusivo para os Donos do bot.");
        }

        const configs = dataService.getConfigsData();
        if (!configs["global"]) configs["global"] = {};
        if (!configs["global"].customMenuNames) configs["global"].customMenuNames = {};

        const customNames = configs["global"].customMenuNames;

        if (args.length === 0) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║    🎨 *CUSTOMIZAÇÃO DE MENUS* 🎨   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "👑 _Personalize os títulos oficiais dos menus do bot:_\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• \`.setmenuname global <Nome do Bot>\` — Alterar cabeçalho principal\n";
            doc += "• \`.setmenuname rpg <Título RPG>\` — Alterar cabeçalho do Menu RPG\n";
            doc += "• \`.setmenuname media <Título Mídia>\` — Alterar cabeçalho do Menu Mídias\n";
            doc += "• \`.setmenuname dono <Título Donos>\` — Alterar cabeçalho do Menu Donos\n";
            doc += "• \`.setmenuname reset <categoria|global>\` — Restaurar padrão\n\n";

            doc += "╭━〔 📜 TÍTULOS ATUAIS 〕━⬣\n";
            doc += "┃ 🌐 *Principal:* " + (customNames["global"] || getBotName()) + "\n";
            doc += "┃ ⚔️ *RPG:* " + (customNames["rpg"] || "MENU RPG & COMBATES") + "\n";
            doc += "┃ 📥 *Mídia:* " + (customNames["media"] || "MENU DOWNLOADS & MÍDIAS") + "\n";
            doc += "┃ 🏆 *Economia:* " + (customNames["economy"] || "MENU PERFIL & ECONOMIA") + "\n";
            doc += "┃ 🧮 *Calculadora:* " + (customNames["calc"] || "MENU CALCULADORA REAL") + "\n";
            doc += "┃ 👑 *Donos:* " + (customNames["owner"] || "MENU DONOS & VPS") + "\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣";
            return reply(doc.trim());
        }

        const targetCat = args[0].toLowerCase().trim()
            .replace("calculadora", "calc")
            .replace("midia", "media")
            .replace("economia", "economy")
            .replace("donos", "owner")
            .replace("dono", "owner")
            .replace("principal", "global")
            .replace("menu", "global");

        if (targetCat === "reset" || targetCat === "padrao") {
            const resetCat = (args[1] || "global").toLowerCase();
            delete customNames[resetCat];
            await dataService.saveConfigsData(configs);
            return reply("🔄 *Título da categoria  + resetCat +  restaurado para o padrão oficial!*");
        }

        const newTitle = args.slice(1).join(" ").trim();
        if (!newTitle) {
            return reply("❌ Digite o novo título para a categoria.\n\n📌 *Exemplo:* \`.setmenuname global ᶜᴿᴬᶻᵞ𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨✖️‿✖️•\`");
        }

        customNames[targetCat] = newTitle;
        await dataService.saveConfigsData(configs);
        logger.info("[MENU NAME UPDATED] Dono alterou título de " + targetCat + " para: " + newTitle);

        return reply("✅ *TÍTULO DE MENU ATUALIZADO COM SUCESSO!*\n\n📂 *Categoria:* \`" + targetCat + "\`\n🏷️ *Novo Cabeçalho:* *" + newTitle + "*");
    }
};
