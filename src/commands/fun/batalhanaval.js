/**
 * MeliodasBot — Comando .batalhanaval / .navios / .naval
 * Jogo tático de batalha naval 5x5 em turnos
 */

const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "batalhanaval",
    aliases: ["navios", "naval", "afundar-frota"],
    category: "fun",
    description: "Desafio tático de batalha naval para afundar navios inimigos",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const tiro = (args[0] || "").toUpperCase().trim();

        if (!tiro) {
            const card = renderCard({
                title: "BATALHA NAVAL DOS SETE MARES",
                icon: "⚓",
                subtitle: `🚢 *Capitão:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "RADAR OCEÂNICO (GRID 5x5)",
                        icon: "🌊",
                        fields: [
                            "    A   B   C   D   E",
                            "1 [ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ]",
                            "2 [ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ]",
                            "3 [ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ]",
                            "4 [ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ]",
                            "5 [ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ][ 🌊 ]"
                        ]
                    },
                    {
                        title: "COMO DISPARAR SEUS CANHÕES",
                        icon: "💥",
                        fields: [
                            "• Digite `.batalhanaval <coordenada>` (ex: `.batalhanaval B3` ou `.batalhanaval D5`)",
                            "• 💥 = Navio Atingido! (Vitória com +800 Coins)",
                            "• 🌊 = Água! (Tiro na água)"
                        ]
                    }
                ],
                tip: "Escolha uma coordenada de A1 até E5 e dispare!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        const acertou = Math.random() > 0.55;
        if (acertou) {
            return reply(`💥 *FOGO CRUZADO! ACERTOU EM CHEIO!*\n\n⚓ Você mirou na coordenada *${tiro}* e explodiu o Cruzador Inimigo!\n🏆 *Recompensa de Guerra:* +800 Coins & +350 XP!`);
        } else {
            return reply(`🌊 *ÁGUA! TIRO PERDIDO!*\n\n🚢 Seu canhão disparou em *${tiro}*, mas atingiu apenas as ondas do oceano. Tente outra coordenada!`);
        }
    }
};
