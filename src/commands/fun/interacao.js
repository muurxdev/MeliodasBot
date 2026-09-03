/**
 * Comandos de Interação Social & Afeto
 * Permite interações dinâmicas entre membros do grupo com cards, menções e controle on/off
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");

const INTERACTIONS = {
    abracar: {
        action: "abraçou carinhosamente",
        solo: "está precisando de um abraço quentinho... 🤗",
        emoji: "🤗",
        frases: [
            "deu um abraço tão apertado que quase quebrou uma costela!",
            "envolveu seus braços com todo carinho e afeto.",
            "deu um abraço fofo e reconfortante."
        ]
    },
    beijar: {
        action: "deu um beijo apaixonado em",
        solo: "mandou um beijinho doce no ar para todo mundo! 😘",
        emoji: "😘",
        frases: [
            "roubou um selinho surpresa!",
            "deu um beijo daqueles de cinema!",
            "deu um beijinho carinhoso na bochecha."
        ]
    },
    tapa: {
        action: "deu um super tapa estalado na cara de",
        solo: "está dando tapas no ar de tanta raiva! 😡",
        emoji: "👋",
        frases: [
            "acertou um tapa tão forte que até a alma balançou!",
            "deu uma bofetada sonora estilo novela das nove!",
            "meteu a mão aberta sem dó nem piedade."
        ]
    },
    cafune: {
        action: "está fazendo um cafuné gostoso na cabeça de",
        solo: "está sonhando com um cafuné bem quentinho... 😴",
        emoji: "💆",
        frases: [
            "fez um cafuné tão suave que deu até soninho.",
            "passou a mão pelos cabelos com muito carinho.",
            "fez aquele cafuné que cura qualquer dia ruim."
        ]
    },
    matar: {
        action: "eliminou sumariamente",
        solo: "ativou o modo Full Counter e explodiu o cenário! 💥",
        emoji: "⚔️",
        frases: [
            "usou a espada Lostvayne e não sobrou nem poeira!",
            "desferiu um golpe crítico fatal!",
            "mandou direto para o submundo dos demônios!"
        ]
    },
    dancar: {
        action: "puxou para dançar juntos",
        solo: "começou a dançar no meio do grupo como se não houvesse amanhã! 💃🕺",
        emoji: "💃",
        frases: [
            "dançaram um forrozinho coladinho!",
            "fizeram uma coreografia sincronizada do TikTok!",
            "arrasaram na pista de dança!"
        ]
    },
    chorar: {
        action: "está chorando no ombro de",
        solo: "desabou no choro pelos cantos... 😭",
        emoji: "😭",
        frases: [
            "molhou a camisa toda com lágrimas!",
            "está chorando litros de emoção!",
            "precisa de um lenço urgentemente."
        ]
    },
    rir: {
        action: "está morrendo de rir da cara de",
        solo: "caiu na gargalhada e não consegue mais parar de rir! 🤣",
        emoji: "🤣",
        frases: [
            "está rindo tanto que a barriga tá doendo!",
            "quase engasgou de tanto dar risada!",
            "não aguentou e explodiu na gargalhada."
        ]
    },
    lamber: {
        action: "deu uma lambida atrevida em",
        solo: "passou a língua nos lábios com fome... 😋",
        emoji: "👅",
        frases: [
            "deu uma lambidinha na bochecha!",
            "provou para ver se era doce!",
            "deixou tudo babado de zoeira."
        ]
    },
    casar: {
        action: "pediu em casamento com aliança de diamante e aceitou com",
        solo: "está sonhando com o casamento perfeito e jogando o buquê! 👰🤵",
        emoji: "💍",
        frases: [
            "e agora estão oficialmente casados e felizes para sempre!",
            "colocaram a aliança no dedo e comemoraram com bolo!",
            "formam o casal mais fofo do grupo!"
        ]
    },
    divorcio: {
        action: "assinou o divórcio e pediu 50% dos bens de",
        solo: "está solteiro(a) e livre na pista de novo! 💔",
        emoji: "💔",
        frases: [
            "e levou embora o cachorro e a televisão!",
            "acabou o amor, agora é cada um pro seu lado!",
            "jogou a aliança fora e foi curtir a vida."
        ]
    }
};

module.exports = {
    name: "interacao",
    aliases: [
        "social", "afeto", "abracar", "abraçar", "beijar", "beijo", "bater", "tapa", "cafune", "cafuné",
        "matar", "dancar", "dançar", "chorar", "rir", "lamber", "casar", "divorcio", "divórcio"
    ],
    category: "fun",
    description: "Comandos sociais e interações de afeto, zoeira e roleplay entre membros (com controle on/off)",
    cooldownMs: 1500,
    execute: async ({ sender, from, isGroup, isAdmin, isOwner, userRole, reply, info, args, commandName }) => {
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const isUserAdmin = isAdmin || isOwner || (userRole && userRole.level >= 3);
        const sub = (args[0] || "").toLowerCase().trim();

        // 1. CONTROLE DE ATIVAÇÃO / DESATIVAÇÃO (.interacao on / off)
        if (commandName === "interacao" || commandName === "social" || commandName === "afeto") {
            if (sub === "on" || sub === "ativar" || sub === "ligar" || sub === "1") {
                if (!isUserAdmin) {
                    return reply("❌ *Acesso Negado:* Apenas Administradores do grupo e Donos do bot podem ativar as interações.");
                }
                configs[from].interacoes = true;
                await dataService.saveConfigsData(configs);
                return reply("✅ *INTERAÇÕES ATIVADAS:* Os comandos de interação social e afeto foram *LIBERADOS* para todos os membros no grupo!");
            }

            if (sub === "off" || sub === "desativar" || sub === "desligar" || sub === "0") {
                if (!isUserAdmin) {
                    return reply("❌ *Acesso Negado:* Apenas Administradores do grupo e Donos do bot podem desativar as interações.");
                }
                configs[from].interacoes = false;
                await dataService.saveConfigsData(configs);
                return reply("🔒 *INTERAÇÕES DESATIVADAS:* Os comandos de interação social foram *DESATIVADOS* para membros comuns neste grupo.\n\n💡 _Para reativar:_ \`.interacao on\`");
            }
        }

        // 2. VERIFICAÇÃO SE INTERAÇÕES ESTÃO DESATIVADAS NO GRUPO
        if (isGroup && configs[from]?.interacoes === false && !isUserAdmin) {
            return reply("🔒 *Interações Desativadas:* Os comandos de interação social e afeto estão desativados pela administração neste grupo.\n\n💡 *Dica:* Administradores podem reativar usando \`.interacao on\`.");
        }

        let key = commandName.toLowerCase()
            .replace("ç", "c")
            .replace("ã", "a")
            .replace("é", "e")
            .replace("ó", "o");

        if (key === "beijo") key = "beijar";
        if (key === "bater") key = "tapa";

        if (!INTERACTIONS[key]) {
            key = sub
                .replace("ç", "c")
                .replace("ã", "a")
                .replace("é", "e")
                .replace("ó", "o");
        }

        const botName = getBotName();
        const inter = INTERACTIONS[key] || INTERACTIONS["abracar"];

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const targetJid = mentioned || (args && args[0] && args[0].includes("@") ? args[0].replace(/[^0-9@s.whatsapp.net]/g, "") : null);

        const senderNumber = sender.split("@")[0].split(":")[0];
        const mentions = [sender];

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   " + inter.emoji + " *INTERAÇÃO SOCIAL* " + inter.emoji + "   ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        if (targetJid && targetJid !== sender) {
            const targetNumber = targetJid.split("@")[0].split(":")[0];
            mentions.push(targetJid);
            const fraseSorteada = inter.frases[Math.floor(Math.random() * inter.frases.length)];

            doc += "🎭 @" + senderNumber + " *" + inter.action + "* @" + targetNumber + "!\n\n";
            doc += "✨ _" + fraseSorteada + "_\n\n";
        } else {
            doc += "🎭 @" + senderNumber + " " + inter.solo + "\n\n";
        }

        doc += "👑 *" + botName + "*";

        return reply(doc.trim(), mentions);
    }
};
