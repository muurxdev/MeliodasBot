/**
 * MeliodasBot — Comando .ppt
 * Pedra, Papel e Tesoura clássico contra o bot
 */

const CHOICES = ["pedra", "papel", "tesoura"];
const EMOJIS = { pedra: "🪨 Pedra", papel: "📄 Papel", tesoura: "✂️ Tesoura" };

module.exports = {
    name: "ppt",
    aliases: ["jokenpo", "pedrapapeltesoura"],
    category: "fun",
    description: "Jogue Pedra, Papel ou Tesoura (Jokenpô) contra o bot",
    execute: async ({ args, reply }) => {
        const userChoice = (args && args[0]) ? args[0].toLowerCase().trim() : "";

        if (!CHOICES.includes(userChoice)) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║       ✂️ *JOKENPÔ / PPT* ✂️      ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👉 *Escolha uma jogada:*\n`;
            doc += `• \`.ppt pedra\` 🪨\n`;
            doc += `• \`.ppt papel\` 📄\n`;
            doc += `• \`.ppt tesoura\` ✂️\n`;
            return reply(doc.trim());
        }

        const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

        let result = "";
        if (userChoice === botChoice) {
            result = "🤝 *EMPATE!* Ambos escolheram o mesmo item.";
        } else if (
            (userChoice === "pedra" && botChoice === "tesoura") ||
            (userChoice === "papel" && botChoice === "pedra") ||
            (userChoice === "tesoura" && botChoice === "papel")
        ) {
            result = "🎉 *VOCÊ VENCEU!* Parabéns pelo golpe perfeito!";
        } else {
            result = "😈 *O BOT VENCEU!* Mais sorte na próxima rodada!";
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║       🎮 *RESULTADO PPT* 🎮      ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Você:* ${EMOJIS[userChoice]}\n`;
        doc += `🤖 *Bot:* ${EMOJIS[botChoice]}\n\n`;
        doc += `${result}\n`;

        return reply(doc.trim());
    }
};

