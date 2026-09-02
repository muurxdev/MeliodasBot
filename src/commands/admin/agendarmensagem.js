/**
 * MeliodasBot — Comando .agendarmensagem / .avisoprogramado
 * Agenda o envio de um lembrete ou comunicado no grupo após um intervalo de tempo
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "agendarmensagem",
    aliases: ["avisoprogramado", "lembretegrupo", "agendaraviso", "schedulemsg"],
    category: "admin",
    description: "Programa um lembrete ou comunicado para ser enviado automaticamente no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, text, reply, args }) => {
        const botName = getBotName();
        const timeArg = (args[0] || "").toLowerCase();
        const msg = args.slice(1).join(" ").trim();

        if (!timeArg || !msg) {
            return reply(
                "❌ *Formato inválido!*\n\n" +
                "📌 *Uso:* `.agendarmensagem <tempo> <mensagem>`\n\n" +
                "💡 *Exemplos:*\n" +
                "• `.agendarmensagem 10m Galera, o evento da guilda começa em 10 minutos!`\n" +
                "• `.agendarmensagem 1h Lembrete de fechar o grupo!`\n" +
                "• `.agendarmensagem 30s Teste de agendamento rápido`"
            );
        }

        let delayMs = 0;
        const match = timeArg.match(/^(\d+)(s|m|h)$/);
        if (!match) return reply("❌ Tempo inválido. Use sufixos: `s` (segundos), `m` (minutos) ou `h` (horas).");

        const val = parseInt(match[1]);
        const unit = match[2];
        if (unit === "s") delayMs = val * 1000;
        else if (unit === "m") delayMs = val * 60 * 1000;
        else if (unit === "h") delayMs = val * 60 * 60 * 1000;

        if (delayMs > 24 * 60 * 60 * 1000) {
            return reply("❌ Limite máximo de agendamento é de 24 horas.");
        }

        setTimeout(async () => {
            try {
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   📢 *COMUNICADO AGENDADO* 📢   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `⏰ *Lembrete Programado pelos Administradores:*\n\n`;
                doc += `📝 ${msg}\n\n`;
                doc += `👑 *${botName}*`;
                await client.sendMessage(from, { text: doc.trim() });
            } catch (err) {
                logger.error("[SCHEDULE MSG ERROR]", err);
            }
        }, delayMs);

        return reply(`✅ *Mensagem agendada com sucesso!* Ela será disparada no grupo daqui a *${timeArg}*.`);
    }
};

