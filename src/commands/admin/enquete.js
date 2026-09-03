/**
 * Comando .enquete / .poll
 * Cria uma enquete interativa diretamente no WhatsApp
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "enquete",
    aliases: ["poll", "votacao", "criarvotacao"],
    category: "admin",
    description: "Cria uma enquete nativa interativa no grupo",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, text, reply }) => {
        const botName = getBotName();
        const raw = (text || "").trim();

        if (!raw || !raw.includes("|")) {
            return reply(
                "❌ *Formato inválido para enquete!*\n\n" +
                "📌 *Uso:* `.enquete Pergunta? | Opção 1 | Opção 2 | Opção 3`\n\n" +
                "💡 *Exemplo:* `.enquete Qual o melhor Pecado Capital? | Meliodas | Escanor | Ban`"
            );
        }

        const parts = raw.split("|").map(s => s.trim()).filter(Boolean);
        const question = parts[0];
        const options = parts.slice(1);

        if (options.length < 2) {
            return reply("❌ Informe pelo menos 2 opções separadas por `|`.");
        }

        try {
            await client.sendMessage(from, {
                poll: {
                    name: `📊 ${question}`,
                    values: options.slice(0, 10),
                    selectableCount: 1
                }
            });
        } catch (err) {
            logger.error("[ENQUETE ERROR]", err);
            return reply(`❌ *Falha ao criar enquete:* ${err.message}`);
        }
    }
};

