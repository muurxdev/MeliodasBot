/**
 * Comando .shoparmas / .lojaarmas / .comprararma
 * Arsenal e loja de armas brancas, mágicas e tesouros sagrados
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { ITEMS_DB, getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");

module.exports = {
    name: "shoparmas",
    aliases: ["lojaarmas", "comprararma", "armas", "arsenal"],
    category: "rpg",
    description: "Loja especializada em espadas, machados e tesouros sagrados de Britânia",
    cooldownMs: 2000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const buyQuery = (text || "").trim();

        const weapons = Object.values(ITEMS_DB).filter(i => i.slot === "arma");

        // Vitrine por TIER: `.shoparmas lendario`, `.shoparmas transcendente`...
        const chaveTier = buyQuery.normalize("NFD").replace(/[^\p{L}]/gu, "").toLowerCase();
        if (chaveTier) {
            const doTier = weapons.filter(w =>
                w.raridade.normalize("NFD").replace(/[^\p{L}]/gu, "").toLowerCase() === chaveTier
            ).sort((a, b) => a.preco - b.preco);
            if (doTier.length) {
                let d = `╔══════════════════════════════╗\n`;
                d += `║  🗡️ *${doTier[0].raridade}* — ${doTier.length} armas  ║\n`;
                d += `╚══════════════════════════════╝\n\n`;
                d += `💰 *Seu Saldo:* *${(user.coins || 0).toLocaleString("pt-BR")} Coins*\n\n`;
                doTier.forEach(w => {
                    d += `╭━〔 ${w.raridade} 〕━⬣\n`;
                    d += `┃ 🗡️ *${w.nome}*\n`;
                    d += `┃ ⚔️ ATK +${w.atk} | 🎯 Crit +${w.crit}% | ⚡ ${w.cp} CP\n`;
                    d += `┃ 💵 *${w.preco.toLocaleString("pt-BR")} Coins*\n`;
                    d += `┃ 🛒 \`.shoparmas ${w.id}\`\n`;
                    d += `╰━━━━━━━━━━━━━━━━━━⬣\n`;
                });
                d += `\n👑 *${botName}*`;
                return reply(d.trim());
            }
        }

        if (buyQuery) {
            const item = getItem(buyQuery);
            if (!item || item.slot !== "arma") {
                return reply(`❌ Arma *"${buyQuery}"* não encontrada no arsenal.`);
            }

            if ((user.coins || 0) < item.preco) {
                return reply(`❌ Você não tem coins suficientes! *${item.nome}* custa *${item.preco.toLocaleString("pt-BR")} Coins* (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= item.preco;
            if (!Array.isArray(user.inventario)) user.inventario = [];
            user.inventario.push({ ...item });

            if (!user.slots) user.slots = {};
            user.slots.arma = item.id;
            user.arma = item.id;

            await dataService.saveXpData(xpData);
            const stats = calculateCharacterStats(user);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🗡️ *ARMA FORJADA COM SUCESSO* 🗡️  ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✨ *Você adquiriu e empunhou:* *${item.nome}*\n`;
            doc += `💎 *Raridade:* ${item.raridade}\n`;
            doc += `⚔️ *Ataque (ATK):* +${item.atk} | 🎯 *Crítico:* +${item.crit}%\n`;
            doc += `💰 *Preço Pago:* ${item.preco.toLocaleString("pt-BR")} Coins\n`;
            doc += `⚡ *Novo Poder de Combate (CP):* *${stats.cp.toLocaleString("pt-BR")} CP*\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🗡️ *ARSENAL DE BRITÂNIA* 🗡️    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💰 *Seu Saldo:* *${(user.coins || 0).toLocaleString("pt-BR")} Coins*\n\n`;

        // Ordena por preço e agrupa por raridade. Enquanto o arsenal for pequeno
        // mostramos tudo; passando de 18 armas a mensagem começaria a arriscar o
        // limite do WhatsApp, então aí a vitrine passa a ser por tier
        // (`.shoparmas lendário`) — mesma ideia da loja de armaduras.
        const ordenadas = [...weapons].sort((a, b) => a.preco - b.preco);
        const LIMITE_VITRINE = 18;

        if (ordenadas.length > LIMITE_VITRINE) {
            const porTier = {};
            for (const w of ordenadas) (porTier[w.raridade] = porTier[w.raridade] || []).push(w);
            doc += `╭━〔 📂 TIERS DISPONÍVEIS 〕━⬣\n`;
            for (const [tier, lista] of Object.entries(porTier)) {
                const chave = tier.replace(/[^\p{L}]/gu, "").toLowerCase();
                const precos = lista.map(i => i.preco);
                doc += `┃ ${tier} — ${lista.length} armas\n`;
                doc += `┃    💵 de ${Math.min(...precos).toLocaleString("pt-BR")} a ${Math.max(...precos).toLocaleString("pt-BR")}\n`;
                doc += `┃    🔎 \`.shoparmas ${chave}\`\n`;
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📦 *Total no arsenal:* ${ordenadas.length} armas\n\n`;
        } else {
            ordenadas.forEach(w => {
                doc += `╭━〔 ${w.raridade} 〕━⬣\n`;
                doc += `┃ 🗡️ *${w.nome}*\n`;
                doc += `┃ ⚔️ ATK: +${w.atk} | 🎯 Crit: +${w.crit}% | ⚡ +${w.cp} CP\n`;
                doc += `┃ 💵 *Preço:* *${w.preco.toLocaleString("pt-BR")} Coins*\n`;
                doc += `┃ 🛒 *Comprar:* \`.shoparmas ${w.id}\`\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            });
        }

        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

