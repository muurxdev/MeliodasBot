/**
 * Comando .boneco / .personagem / .avatar / .statusrpg
 * Renderização dinâmica do Boneco de Emoji com níveis de armadura e customização de atributos
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser, barraXP, calcularXpNecessario, getCargo } = require("../../services/xpService");
const { getItem } = require("../../services/rpgEquipmentService");
const { calculateFullCharacterStats, renderCharacterAvatar, RACES, ELEMENTS, getRebirthInfo, resolveHp } = require("../../services/characterEngine");

module.exports = {
    name: "boneco",
    aliases: ["personagem", "avatar", "meuboneco", "statusrpg", "meuheroi", "criarboneco"],
    category: "rpg",
    description: "Exibe seu boneco personalizado renderizado em emojis, slots de armadura e poder total",
    cooldownMs: 2000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);
        const rebirthInfo = getRebirthInfo(user);

        const sub = (args[0] || "").toLowerCase().trim();
        const param = args.slice(1).join(" ").trim();

        // 1. ALTERAR NOME DO PERSONAGEM
        if (sub === "nome" || sub === "nick" || sub === "setnome") {
            if (!param) return reply("📌 *Como mudar o nome:* `.boneco nome <novo_nome>`\n👉 *Exemplo:* `.boneco nome Arthur Pendragon`");
            user.nicknameRpg = param;
            user.name = param;
            await dataService.saveXpData(xpData);
            return reply(`👑 *Nome do Personagem Atualizado:* **${param}**!`);
        }

        // 2. ALTERAR RAÇA
        if (sub === "raca" || sub === "classe-raca") {
            const rKey = param.toLowerCase();
            if (!RACES[rKey]) {
                const racasStr = Object.keys(RACES).map(k => `• \`${k}\` (${RACES[k].nome})`).join("\n");
                return reply(`📌 *Escolha uma Raça válida:*\n${racasStr}\n\n👉 *Uso:* \`.boneco raca demonio\``);
            }
            user.characterRace = rKey;
            user.character_race = rKey;
            await dataService.saveXpData(xpData);
            return reply(`✨ *Raça Atualizada:* **${RACES[rKey].nome}** ${RACES[rKey].emoji} (+${RACES[rKey].bonusAtk} ATK / +${RACES[rKey].bonusHp} HP)!`);
        }

        // 3. ALTERAR ELEMENTO
        if (sub === "elemento" || sub === "elem") {
            const eKey = param.toLowerCase();
            if (!ELEMENTS[eKey]) {
                const elemStr = Object.keys(ELEMENTS).map(k => `• \`${k}\` (${ELEMENTS[k].nome})`).join("\n");
                return reply(`📌 *Escolha um Elemento válido:*\n${elemStr}\n\n👉 *Uso:* \`.boneco elemento fogo\``);
            }
            user.characterElement = eKey;
            user.character_element = eKey;
            await dataService.saveXpData(xpData);
            return reply(`🔥 *Elemento de Combate Atualizado:* **${ELEMENTS[eKey].nome}** ${ELEMENTS[eKey].emoji}!`);
        }

        // 4. RENDERIZAÇÃO VISUAL COMPLETA
        const avatarVisual = renderCharacterAvatar(user, stats);
        const slots = user.slots || {};
        const codinome = user.nicknameRpg || user.name || "Cavaleiro Sagrado de Britannia";
        const cleanNumber = sender.split("@")[0].split(":")[0];

        function getSlotDisplay(slotKey, def) {
            const itemRef = slots[slotKey];
            if (!itemRef) return `⚪ _[${def}]_`;
            const item = typeof itemRef === "object" ? itemRef : getItem(itemRef);
            if (!item) return `⚪ _[${def}]_`;
            return `*${item.nome}* (${item.raridade || '⚪ Comum'})`;
        }

        const maxXp = calcularXpNecessario(user.level || 1);
        const currentXp = user.xp || 0;
        const barra = barraXP(currentXp, user.level || 1);
        const cargo = getCargo(user.level || 1);

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        doc += `┃   🛡️ *FICHA & BONECO DO GUERREIRO* 🛡️   \n`;
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        doc += `╭━━━〔 🧙‍♂️ AVATAR VISUAL DE COMBATE 〕━━━┈⊷\n`;
        doc += `${avatarVisual}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        doc += `👑 *Nome:* **${codinome}** (@${cleanNumber})\n`;
        doc += `🧬 *Raça:* ${stats.race}  |  🔥 *Elemento:* ${stats.element}\n`;
        doc += `🎖️ *Patente:* ${cargo} ${user.classe ? `(${user.classe})` : ""}\n`;
        doc += `📈 *Nível:* **${user.level || 1}** ${barra}\n`;
        doc += `🌀 *Rebirths:* **${rebirthInfo.rebirths} / ${rebirthInfo.maxRebirths}** (+${rebirthInfo.bonusDmgPercent}% Dano/XP)\n`;
        doc += `⚡ *Poder de Combate (CP):* **${stats.cp.toLocaleString("pt-BR")} CP**\n\n`;

        doc += `╭━━━〔 🧰 EQUIPAMENTOS POR SLOT 〕━━━┈⊷\n`;
        doc += `┃ 👑 *Cabeça:* ${getSlotDisplay("capacete", "Sem Elmo")}\n`;
        doc += `┃ 🛡️ *Tronco:* ${getSlotDisplay("peitoral", "Sem Armadura")}\n`;
        doc += `┃ 👖 *Pernas:* ${getSlotDisplay("calca", "Sem Calças")}\n`;
        doc += `┃ 👢 *Pés:* ${getSlotDisplay("botas", "Sem Botas")}\n`;
        doc += `┃ 🗡️ *Arma Principal:* ${getSlotDisplay("arma", "Punhos Desarmados")} (+${user.forgeLevel || 0} Forja)\n`;
        doc += `┃ 🛡️ *Mão Secundária:* ${getSlotDisplay("escudo", "Sem Escudo")}\n`;
        doc += `┃ 💍 *Amuleto:* ${getSlotDisplay("amuleto", "Sem Amuleto")}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        doc += `╭━━━〔 📊 ATRIBUTOS TOTAIS REAIS 〕━━━┈⊷\n`;
        const _hp = resolveHp(user);
        doc += `┃ ❤️ *Vida (HP):* **${_hp.atual.toLocaleString("pt-BR")} / ${_hp.max.toLocaleString("pt-BR")} HP** (${_hp.percent}%)\n`;
        doc += `┃ ${_hp.barra}\n`;
        doc += `┃ ⚔️ *Ataque Real (ATK):* **+${stats.atk.toLocaleString("pt-BR")}**\n`;
        doc += `┃ 🛡️ *Defesa Real (DEF):* **+${stats.def.toLocaleString("pt-BR")}**\n`;
        doc += `┃ 🎯 *Crítico:* **${stats.crit}%** | 💨 *Esquiva:* **${stats.esq}%** | 🛡️ *Bloqueio:* **${stats.bloq}%**\n`;
        if (stats.hasFogueira) doc += `┃ 🔥 *Fogueira Ativa:* +20% Dano de Queimadura\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        doc += `💡 _Customizar:_ \`.boneco nome <nome>\` | \`.boneco raca <raca>\` | \`.boneco elemento <elemento>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
