/**
 * Comando .reencarnar / .rebirth
 * Renascimento Supremo: exige Nível 100+, reseta o nível para 1, reseta o mundo para 'floresta'
 * (bloqueando mundos avançados até atingir os níveis correspondentes) e concede +25% DMG/XP perpétuo por Rebirth (máx 10).
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getRebirthInfo, calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

const confirmacoesRebirth = new Map();

module.exports = {
    name: "reencarnar",
    aliases: ["renascer", "rebirth", "reborn", "transcender", "ascensao-divina"],
    category: "rpg",
    description: "Reencarne seu herói: ritual perigoso com confirmação que reseta progresso por +25% bônus permanente acumulativo",
    cooldownMs: 4000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const info = getRebirthInfo(user);

        if (!info.canRebirth) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌌 *TEMPLO DA REENCARNAÇÃO* 🌌  \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `⚠️ *REENCARNAÇÃO BLOQUEADA!*\n\n`;
            doc += `╭━〔 📜 REQUISITOS SAGRADOS 〕━⬣\n`;
            doc += `┃ 📈 *Nível Mínimo Exigido:* Nível 100\n`;
            doc += `┃ 👤 *Seu Nível Atual:* Nível ${info.currentLevel}\n`;
            doc += `┃ 🌀 *Rebirths Atuais:* ${info.rebirths} (Progressão Infinita)\n`;
            doc += `┃ 🎁 *Bônus Atual:* +${info.bonusDmgPercent}% Dano & XP\n`;
            doc += `┃ 🔜 *Bônus Próximo Rebirth:* +${info.nextBonusDmgPercent}% Dano & XP\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reencarnar, você deve atingir o nível 100 através de caçadas (\`.hunt\`), bosses (\`.boss\`), masmorras (\`.dungeon\`) e missões (\`.missao\`)._\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. ETAPA DE CONFIRMAÇÃO DE SEGURANÇA
        if (sub !== "confirmar" && sub !== "sim") {
            confirmacoesRebirth.set(sender, Date.now() + 60000);

            let aviso = `╔══════════════════════════════╗\n`;
            aviso += `║   ⚠️ *RITUAL SAGRADO DE REBIRTH* ⚠️   \n`;
            aviso += `╚══════════════════════════════╝\n\n`;
            aviso += `👤 *Guerreiro:* @${sender.split("@")[0]}\n`;
            aviso += `🌀 *Rebirth Atual:* ${info.rebirths}º Renascimento\n`;
            aviso += `🔜 *Próximo Rebirth:* **${info.rebirths + 1}º Renascimento (+${(info.rebirths + 1) * 25}% Dano & XP Globais)**\n\n`;

            aviso += `🔥 *ATENÇÃO: O RENASCIMENTO É PERIGOSO E IRREVERSÍVEL!* 🔥\n\n`;
            aviso += `╭━〔 💀 DADOS QUE SERÃO ZERADOS DO ZERO 〕━⬣\n`;
            aviso += `┃ 📉 *Nível:* Retornará ao Nível 1 (0 XP)\n`;
            aviso += `┃ 💰 *Coins:* Carteira será zerada (0 Coins)\n`;
            aviso += `┃ 🎒 *Mochila:* Todos os itens do inventário serão limpos\n`;
            aviso += `┃ ⚔️ *Equipamentos:* Todos os slots serão desequipados\n`;
            aviso += `┃ 🔨 *Forja:* Nível de forja reiniciado para 0\n`;
            aviso += `┃ 📊 *Placar & Combate:* Vitórias, derrotas e pontos de arena zerados\n`;
            aviso += `┃ 🏰 *Progresso:* Masmorra e Torre voltam ao Andar 1\n`;
            aviso += `┃ 🌲 *Mundo:* Retornará à Floresta dos Bugs\n`;
            aviso += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

            aviso += `╭━〔 ✨ O QUE VOCÊ PRESERVA E RECEBE 〕━⬣\n`;
            aviso += `┃ 🌀 *Grau de Rebirth:* +1 Grau definitivo e acumulativo\n`;
            aviso += `┃ 💥 *Bônus Permanente:* +${(info.rebirths + 1) * 25}% de Dano e XP Globais em todas as batalhas\n`;
            aviso += `┃ 👑 *Aura Visual:* Nova aura mística no seu avatar (\`.boneco\`)\n`;
            aviso += `┃ 🚀 *Velocidade:* Evolução muito mais rápida rumo aos mundos cósmicos\n`;
            aviso += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

            aviso += `🔒 *CONFIRMAÇÃO DE SEGURANÇA (Válida por 60s):*\n`;
            aviso += `👉 Digite: *.reencarnar confirmar*\n`;
            aviso += `👑 *${botName}*`;

            return reply(aviso.trim(), [sender]);
        }

        // 2. VERIFICA SE A CONFIRMAÇÃO ESTÁ VÁLIDA
        const expiraEm = confirmacoesRebirth.get(sender);
        if (!expiraEm || Date.now() > expiraEm) {
            confirmacoesRebirth.delete(sender);
            return reply(`⏳ *Confirmação expirada ou não solicitada!*\n\nDigite primeiro \`.reencarnar\` para ler os avisos de segurança antes de confirmar.`);
        }
        confirmacoesRebirth.delete(sender);

        // 3. EXECUÇÃO DO RESET TOTAL COM INCREMENTO DO REBIRTH
        const nextRebirth = info.rebirths + 1;
        user.rebirthCount = nextRebirth;
        user.rebirth_count = nextRebirth;
        user.level = 1;
        user.xp = 0;
        user.coins = 0;
        user.inventario = [];
        user.inventory = [];
        user.slots = {
            capacete: null,
            peitoral: null,
            calca: null,
            botas: null,
            arma: null,
            escudo: null,
            amuleto: null
        };
        user.equipado = null;
        user.arma = null;
        user.forgeLevel = 0;
        user.forge_level = 0;
        user.wins = 0;
        user.losses = 0;
        user.arenaPontos = 0;
        user.arenaAtual = 1;
        user.mundo = 'floresta';
        user.dungeonFloor = 1;
        user.dungeonRecorde = 0;
        user.towerFloor = 1;
        user.towerRecorde = 0;
        user.hp = 120;
        user.hpMax = 120;

        await dataService.saveUser(user, { force: true });

        const newStats = calculateFullCharacterStats(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🌌 *TRANSCENDÊNCIA REALIZADA!* 🌌  \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Você renasceu das cinzas com o poder dos Deuses de Britannia!* ✨\n\n`;
        doc += `╭━〔 🌀 STATUS DO NOVO CICLO (${nextRebirth}º REBIRTH) 〕━⬣\n`;
        doc += `┃ 👑 *Grau de Rebirth:* **${nextRebirth}º Renascimento** (Progressão Infinita)\n`;
        doc += `┃ 📈 *Nível Reiniciado:* Nível 1 (0 XP | 0 Coins)\n`;
        doc += `┃ 🌍 *Mundo:* 🌲 **Floresta dos Bugs**\n`;
        doc += `┃ 💥 *Bônus Permanente Ativo:* **+${nextRebirth * 25}% Dano e XP Globais**!\n`;
        doc += `┃ ⚔️ *Ataque Base com Bônus:* ${newStats.atk.toLocaleString("pt-BR")} ATK\n`;
        doc += `┃ 🛡️ *Defesa Base com Bônus:* ${newStats.def.toLocaleString("pt-BR")} DEF\n`;
        doc += `┃ ⚡ *Poder Inicial (CP):* ${newStats.cp.toLocaleString("pt-BR")} CP\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Você começou do zero com poder ampliado em +${nextRebirth * 25}%. Conquiste os novos mundos e masmorras!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
