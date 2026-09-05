/**
 * Comando .shoparmaduras / .lojaarmaduras / .comprararmadura
 * Forja e loja de armaduras (Capacetes, Peitorais, Calças, Botas, Escudos e Amuletos)
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { ITEMS_DB, getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");

module.exports = {
    name: "shoparmaduras",
    aliases: ["lojaarmaduras", "comprararmadura", "armaduras", "forjaequipamentos"],
    category: "rpg",
    description: "Loja especializada em armaduras, elmos, perneiras, botas, escudos e amuletos",
    cooldownMs: 2000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const buyQuery = (text || "").trim();

        const armors = Object.values(ITEMS_DB).filter(i => i.slot !== "arma");

        const SLOTS = ["capacete", "peitoral", "calca", "botas", "escudo", "amuleto"];
        const EMOJI_SLOT = { capacete: "👑", peitoral: "🛡️", calca: "👖", botas: "👢", escudo: "🛡️", amuleto: "💍" };

        // Vitrine por SLOT. Antes a loja fazia slice(0, 12) numa lista de 51 itens:
        // tudo que foi adicionado depois (inclusive os tiers Lendário/Transcendente)
        // ficava invisível — comprável só por id, mas impossível de descobrir.
        const alvoSlot = SLOTS.find(s => s === buyQuery.toLowerCase());
        if (alvoSlot) {
            const doSlot = armors.filter(i => i.slot === alvoSlot)
                .sort((a, b) => a.preco - b.preco);
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ${EMOJI_SLOT[alvoSlot]} *${alvoSlot.toUpperCase()}* — ${doSlot.length} itens   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `💰 *Seu Saldo:* *${(user.coins || 0).toLocaleString("pt-BR")} Coins*\n\n`;
            doSlot.forEach(a => {
                doc += `╭━〔 ${a.raridade} 〕━⬣\n`;
                doc += `┃ ${EMOJI_SLOT[alvoSlot]} *${a.nome}*\n`;
                doc += `┃ 🛡️ DEF +${a.def} | ❤️ HP +${a.hp} | ⚡ ${a.cp} CP\n`;
                doc += `┃ 💵 *${a.preco.toLocaleString("pt-BR")} Coins*\n`;
                doc += `┃ 🛒 \`.shoparmaduras ${a.id}\`\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`;
            });
            doc += `\n👑 *${botName}*`;
            return reply(doc.trim());
        }

        if (buyQuery) {
            const item = getItem(buyQuery);
            if (!item || item.slot === "arma") {
                return reply(`❌ Armadura *"${buyQuery}"* não encontrada na forja.\n\n💡 _Veja as categorias com_ \`.shoparmaduras\`_._`);
            }

            if ((user.coins || 0) < item.preco) {
                return reply(`❌ Você não tem coins suficientes! *${item.nome}* custa *${item.preco.toLocaleString("pt-BR")} Coins* (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= item.preco;
            if (!Array.isArray(user.inventario)) user.inventario = [];
            user.inventario.push({ ...item });

            if (!user.slots) user.slots = {};
            user.slots[item.slot] = item.id;

            await dataService.saveXpData(xpData);
            const stats = calculateCharacterStats(user);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *ARMADURA EQUIPADA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✨ *Você forjou e vestiu:* *${item.nome}*\n`;
            doc += `🏷️ *Slot:* ${item.slot.toUpperCase()}\n`;
            doc += `💎 *Raridade:* ${item.raridade}\n`;
            doc += `🛡️ *Defesa (DEF):* +${item.def} | ❤️ *Vida (HP):* +${item.hp}\n`;
            doc += `💰 *Preço Pago:* ${item.preco.toLocaleString("pt-BR")} Coins\n`;
            doc += `⚡ *Novo Poder de Combate (CP):* *${stats.cp.toLocaleString("pt-BR")} CP*\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *FORJA DE ARMADURAS* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💰 *Seu Saldo:* *${(user.coins || 0).toLocaleString("pt-BR")} Coins*\n\n`;

        doc += `╭━〔 📂 CATEGORIAS 〕━⬣\n`;
        for (const s of SLOTS) {
            const doSlot = armors.filter(i => i.slot === s);
            if (!doSlot.length) continue;
            const precos = doSlot.map(i => i.preco);
            doc += `┃ ${EMOJI_SLOT[s]} \`.shoparmaduras ${s}\` — ${doSlot.length} itens\n`;
            doc += `┃    💵 de ${Math.min(...precos).toLocaleString("pt-BR")} a ${Math.max(...precos).toLocaleString("pt-BR")} Coins\n`;
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        // Destaque: o melhor item que o jogador JÁ consegue pagar agora.
        const acessiveis = armors.filter(i => i.preco <= (user.coins || 0)).sort((a, b) => b.cp - a.cp);
        if (acessiveis.length) {
            const top = acessiveis[0];
            doc += `╭━〔 ⭐ MELHOR AO SEU ALCANCE 〕━⬣\n`;
            doc += `┃ ${top.raridade} *${top.nome}*\n`;
            doc += `┃ 🛡️ DEF +${top.def} | ❤️ HP +${top.hp} | ⚡ ${top.cp} CP\n`;
            doc += `┃ 💵 *${top.preco.toLocaleString("pt-BR")} Coins*\n`;
            doc += `┃ 🛒 \`.shoparmaduras ${top.id}\`\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        }

        doc += `📦 *Total no acervo:* ${armors.length} peças\n`;
        doc += `💡 _Abra uma categoria para ver tudo. Ex.:_ \`.shoparmaduras escudo\`\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

