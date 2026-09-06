/**
 * Comando .reencarnar / .rebirth
 * Renascimento Supremo em duas modalidades:
 * 1. Normal: Exige Nível 100+, gratuito, reseta inventário, equipamentos e moedas por +25% DMG/XP perpétuo.
 * 2. Premium (.reencarnar premium): Exige Nível 500+ e 1 Bilhão de Coins (1.000.000.000).
 *    PRESERVA moedas restantes, inventário completo, todos os equipamentos/slots e nível de forja.
 *    Reseta apenas o Nível para 1 e Mundo para Floresta, concedendo o Grau de Rebirth (+25% perpétuo).
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getRebirthInfo, calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

const confirmacoesRebirth = new Map(); // sender -> { expiraEm: number, tipo: 'normal'|'premium' }

const CUSTO_PREMIUM_COINS = 1_000_000_000;
const NIVEL_MIN_PREMIUM = 500;
const NIVEL_MIN_NORMAL = 100;

module.exports = {
    name: "reencarnar",
    aliases: ["renascer", "rebirth", "reborn", "transcender", "ascensao-divina"],
    category: "rpg",
    description: "Reencarne seu herói: modalidade Normal (Nv. 100+) ou Premium (Nv. 500+ e 1 Bilhão, mantém Coins/Inv/Equips)",
    cooldownMs: 4000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const info = getRebirthInfo(user);
        const argsStr = args.map(a => a.toLowerCase().trim());
        const isPremium = argsStr.includes("premium") || argsStr.includes("vip") || argsStr.includes("ouro");
        const isConfirmar = argsStr.includes("confirmar") || argsStr.includes("sim") || argsStr.includes("confirm");

        // -------------------------------------------------------------
        // FLUXO DO REBIRTH PREMIUM
        // -------------------------------------------------------------
        if (isPremium) {
            // Validações do Rebirth Premium
            const nivelAtual = Number(user.level || 1);
            const saldoCoins = Number(user.coins || 0);

            if (nivelAtual < NIVEL_MIN_PREMIUM) {
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   👑 *TEMPLO DO REBIRTH PREMIUM* 👑  \n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `⚠️ *REBIRTH PREMIUM BLOQUEADO!*\n\n`;
                doc += `╭━〔 📜 REQUISITOS SAGRADOS PREMIUM 〕━⬣\n`;
                doc += `┃ 📈 *Nível Mínimo Exigido:* Nível ${NIVEL_MIN_PREMIUM}\n`;
                doc += `┃ 👤 *Seu Nível Atual:* Nível ${nivelAtual}\n`;
                doc += `┃ 💰 *Custo Necessário:* ${CUSTO_PREMIUM_COINS.toLocaleString("pt-BR")} Coins (1 Bilhão)\n`;
                doc += `┃ 💵 *Seu Saldo Atual:* ${saldoCoins.toLocaleString("pt-BR")} Coins\n`;
                doc += `┃ 🌀 *Rebirths Atuais:* ${info.rebirths}º Grau\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💎 *Vantagem Exclusiva do Premium:*\n`;
                doc += `_Mantém seu inventário, armas, armaduras, slots equipados, nível da forja e moedas restantes (desconta apenas 1 Bilhão)!_\n\n`;
                doc += `💡 _Para upar mais rápido até o Nível ${NIVEL_MIN_PREMIUM}: use \`.hunt\`, \`.dungeon\`, \`.boss\` e \`.missao\`._\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), [sender]);
            }

            if (saldoCoins < CUSTO_PREMIUM_COINS) {
                const faltam = CUSTO_PREMIUM_COINS - saldoCoins;
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🪙 *SALDO INSUFICIENTE (PREMIUM)* 🪙  \n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `⚠️ *Você não possui moedas suficientes para o Rebirth Premium!*\n\n`;
                doc += `╭━〔 💰 DETALHES FINANCEIROS 〕━⬣\n`;
                doc += `┃ 💎 *Custo do Rebirth Premium:* ${CUSTO_PREMIUM_COINS.toLocaleString("pt-BR")} Coins (1 Bilhão)\n`;
                doc += `┃ 💵 *Seu Saldo Atual:* ${saldoCoins.toLocaleString("pt-BR")} Coins\n`;
                doc += `┃ ❌ *Faltam:* ${faltam.toLocaleString("pt-BR")} Coins\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Você pode farmar moedas em \`.dungeon\`, \`.boss\`, \`.trabalhar\`, \`.cassino\` ou utilizar o Rebirth Normal gratuito com \`.reencarnar\` (exige Nível 100)._\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), [sender]);
            }

            // Confirmação do Rebirth Premium
            if (!isConfirmar) {
                confirmacoesRebirth.set(sender, { expiraEm: Date.now() + 60000, tipo: "premium" });

                let aviso = `╔══════════════════════════════╗\n`;
                aviso += `║   👑 *RITUAL DE REBIRTH PREMIUM* 👑   \n`;
                aviso += `╚══════════════════════════════╝\n\n`;
                aviso += `👤 *Guerreiro Supremo:* @${sender.split("@")[0]}\n`;
                aviso += `🌀 *Rebirth Atual:* ${info.rebirths}º Renascimento\n`;
                aviso += `🔜 *Próximo Grau:* **${info.rebirths + 1}º Renascimento (+${(info.rebirths + 1) * 25}% Dano & XP Globais)**\n\n`;

                aviso += `╭━〔 ✨ PRIVILÉGIOS PRESERVADOS NO PREMIUM 〕━⬣\n`;
                aviso += `┃ 🎒 *Mochila & Inventário:* PRESERVADOS 100% (nenhum item é perdido!)\n`;
                aviso += `┃ ⚔️ *Equipamentos & Slots:* TODOS os itens equipados permanecem nos slots!\n`;
                aviso += `┃ 🔨 *Forja Real:* Nível +${user.forgeLevel || 0} mantido intacto!\n`;
                aviso += `┃ 💰 *Coins Restantes:* Desconta apenas 1 Bilhão. O restante FICA COM VOCÊ!\n`;
                aviso += `┃ 💥 *Bônus Divino:* +25% permanente cumulativo em TODO o dano e XP!\n`;
                aviso += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

                aviso += `╭━〔 🔄 O QUE SERÁ REINICIADO 〕━⬣\n`;
                aviso += `┃ 📉 *Nível:* Retornará ao Nível 1 (para você upar com os novos multiplicadores)\n`;
                aviso += `┃ 🌲 *Mundo:* Retornará à Floresta dos Bugs\n`;
                aviso += `┃ 🏰 *Masmorra / Torre:* Retornam ao Andar 1 para novo farm de loots\n`;
                aviso += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

                aviso += `🔒 *CONFIRMAÇÃO DE SEGURANÇA (Válida por 60s):*\n`;
                aviso += `👉 Digite: *.reencarnar premium confirmar*\n`;
                aviso += `👑 *${botName}*`;

                return reply(aviso.trim(), [sender]);
            }

            // Executa Confirmação Premium
            const pendente = confirmacoesRebirth.get(sender);
            if (!pendente || pendente.tipo !== "premium" || Date.now() > pendente.expiraEm) {
                confirmacoesRebirth.delete(sender);
                return reply(`⏳ *Confirmação expirada ou não solicitada!*\n\nDigite primeiro \`.reencarnar premium\` para revisar as vantagens antes de confirmar.`);
            }
            confirmacoesRebirth.delete(sender);

            // Debita 1 bilhão e aplica a transição Premium
            user.coins = Math.max(0, saldoCoins - CUSTO_PREMIUM_COINS);
            const nextRebirth = info.rebirths + 1;
            user.rebirthCount = nextRebirth;
            user.rebirth_count = nextRebirth;
            user.level = 1;
            user.xp = 0;
            user.mundo = 'floresta';
            user.dungeonFloor = 1;
            user.towerFloor = 1;
            user.hp = Math.max(120, user.hp || 120);

            // MANTÉM: inventario, inventory, slots, equipado, arma, forgeLevel, pets, skills, conquistas!
            await dataService.saveUser(user, { force: true });

            const newStats = calculateFullCharacterStats(user);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌟 *TRANSCENDÊNCIA PREMIUM REALIZADA!* 🌟  \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👑 *Você alcançou a Ascensão dos Deuses Antigos mantendo todo seu arsenal!* 👑\n\n`;
            doc += `╭━〔 🌀 STATUS DO NOVO CICLO (${nextRebirth}º REBIRTH) 〕━⬣\n`;
            doc += `┃ 👑 *Grau de Rebirth:* **${nextRebirth}º Renascimento**\n`;
            doc += `┃ 📈 *Nível:* Nível 1 (Pronto para nova escalada épica)\n`;
            doc += `┃ 🌍 *Mundo:* 🌲 **Floresta dos Bugs**\n`;
            doc += `┃ 💥 *Bônus Permanente Ativo:* **+${nextRebirth * 25}% Dano e XP Globais**!\n`;
            doc += `┃ 💰 *Coins Restantes:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n`;
            doc += `┃ 🎒 *Itens no Inventário:* ${(user.inventario || []).length} itens preservados\n`;
            doc += `┃ 🔨 *Nível de Forja:* +${user.forgeLevel || 0} preservado\n`;
            doc += `┃ ⚔️ *Ataque Total Atual:* ${newStats.atk.toLocaleString("pt-BR")} ATK\n`;
            doc += `┃ 🛡️ *Defesa Total Atual:* ${newStats.def.toLocaleString("pt-BR")} DEF\n`;
            doc += `┃ ⚡ *Poder Total (CP):* ${newStats.cp.toLocaleString("pt-BR")} CP\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Seu arsenal lendário continua intacto! Domine os mundos novamente com seu multiplicador de +${nextRebirth * 25}%!_\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // -------------------------------------------------------------
        // FLUXO DO REBIRTH NORMAL (GRÁTIS, NÍVEL 100+)
        // -------------------------------------------------------------
        if (!info.canRebirth) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌌 *TEMPLO DA REENCARNAÇÃO* 🌌  \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `⚠️ *REENCARNAÇÃO BLOQUEADA!*\n\n`;
            doc += `╭━〔 📜 REQUISITOS SAGRADOS 〕━⬣\n`;
            doc += `┃ 📈 *Nível Mínimo Exigido:* Nível ${NIVEL_MIN_NORMAL}\n`;
            doc += `┃ 👤 *Seu Nível Atual:* Nível ${info.currentLevel}\n`;
            doc += `┃ 🌀 *Rebirths Atuais:* ${info.rebirths} (Progressão Infinita)\n`;
            doc += `┃ 🎁 *Bônus Atual:* +${info.bonusDmgPercent}% Dano & XP\n`;
            doc += `┃ 🔜 *Bônus Próximo Rebirth:* +${info.nextBonusDmgPercent}% Dano & XP\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reencarnar, você deve atingir o nível 100 através de caçadas (\`.hunt\`), bosses (\`.boss\`), masmorras (\`.dungeon\`) e missões (\`.missao\`)._\n\n`;
            doc += `👑 *Deseja manter seus equipamentos e moedas?*\n`;
            doc += `Conheça o *Rebirth Premium*: \`.reencarnar premium\` (Nível 500+ e 1 Bilhão de coins)\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        // 1. ETAPA DE CONFIRMAÇÃO DE SEGURANÇA NORMAL
        if (!isConfirmar) {
            confirmacoesRebirth.set(sender, { expiraEm: Date.now() + 60000, tipo: "normal" });

            let aviso = `╔══════════════════════════════╗\n`;
            aviso += `║   ⚠️ *RITUAL SAGRADO DE REBIRTH* ⚠️   \n`;
            aviso += `╚══════════════════════════════╝\n\n`;
            aviso += `👤 *Guerreiro:* @${sender.split("@")[0]}\n`;
            aviso += `🌀 *Rebirth Atual:* ${info.rebirths}º Renascimento\n`;
            aviso += `🔜 *Próximo Rebirth:* **${info.rebirths + 1}º Renascimento (+${(info.rebirths + 1) * 25}% Dano & XP Globais)**\n\n`;

            aviso += `🔥 *ATENÇÃO: O RENASCIMENTO COMUM É PERIGOSO E RESETA O PROGRESSO!* 🔥\n\n`;
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

            aviso += `💎 _Deseja MANTER inventário, equipamentos, forja e moedas?_\n`;
            aviso += `👉 Digite: *.reencarnar premium* (Nível 500+ e 1 Bilhão)\n\n`;

            aviso += `🔒 *CONFIRMAÇÃO DO REBIRTH COMUM (Válida por 60s):*\n`;
            aviso += `👉 Digite: *.reencarnar confirmar*\n`;
            aviso += `👑 *${botName}*`;

            return reply(aviso.trim(), [sender]);
        }

        // 2. VERIFICA SE A CONFIRMAÇÃO NORMAL ESTÁ VÁLIDA
        const expiraPendente = confirmacoesRebirth.get(sender);
        if (!expiraPendente || expiraPendente.tipo !== "normal" || Date.now() > expiraPendente.expiraEm) {
            confirmacoesRebirth.delete(sender);
            return reply(`⏳ *Confirmação expirada ou não solicitada!*\n\nDigite primeiro \`.reencarnar\` para ler os avisos de segurança antes de confirmar.`);
        }
        confirmacoesRebirth.delete(sender);

        // 3. EXECUÇÃO DO RESET TOTAL COM INCREMENTO DO REBIRTH COMUM
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
