/**
 * Comando .autofix / .reparar / .selfheal
 * Executa diagnóstico profundo autônomo, corrige falhas e retorna o relatório de saúde
 */

const { runSelfHeal } = require("../../services/selfHealService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "autofix",
    aliases: ["reparar", "selfheal", "fixbot", "verificarbot", "saudebot"],
    category: "owner",
    description: "Executa diagnóstico autônomo, repara inconsistências, limpa caches e retorna o status de saúde do bot",
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply, sender }) => {
        const botName = getBotName();
        await reply("🛠️ *Iniciando rotina autônoma de diagnóstico e auto-reparação...* Aguarde.");

        try {
            const result = await runSelfHeal();
            const { repaired, warnings, stats, allHealthy } = result;

            let doc = "╔══════════════════════════════╗\n";
            doc += "║  🛠️ *RELATÓRIO DE AUTO-REPARO* 🛠️  ║\n";
            doc += "╚══════════════════════════════╝\n\n";

            doc += `📊 *Status Geral:* ${allHealthy ? "🟢 *100% SAUDÁVEL & OPERACIONAL*" : "🟡 *ATENÇÃO A ALGUNS AVISOS*"}\n`;
            doc += `⏱️ *Uptime:* ${stats.uptime}\n`;
            doc += `🧠 *Memória RAM:* ${stats.rss} (Heap: ${stats.heapUsed})\n`;
            doc += `💾 *Integridade SQLite:* ${stats.sqliteIntegrity || "OK"}\n`;
            doc += `🎮 *Comandos Ativos:* ${stats.totalCommands} (+ ${stats.totalAliases} aliases)\n`;
            doc += `🎬 *Wallpapers:* ${stats.wallpapers || "OK"}\n`;
            doc += `🍪 *Cookies de Mídia:* ${stats.cookies}\n\n`;

            if (repaired && repaired.length > 0) {
                doc += "╭━〔 🔧 AÇÕES & REPAROS EXECUTADOS 〕━⬣\n";
                for (const r of repaired) {
                    doc += `┃ ✅ ${r}\n`;
                }
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            }

            if (warnings && warnings.length > 0) {
                doc += "╭━〔 ⚠️ AVISOS / PENDÊNCIAS 〕━⬣\n";
                for (const w of warnings) {
                    doc += `┃ ⚠️ ${w}\n`;
                }
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            } else {
                doc += "✨ *Nenhum erro ou anomalia foi detectado no sistema.*\n";
                doc += "🛡️ Todos os módulos, rotas, conexões e bancos estão em perfeita harmonia.\n\n";
            }

            doc += `👑 *${botName}*`;

            logger.info(`[AUTOFIX] Diagnóstico executado por ${sender} (Saudável: ${allHealthy})`);
            return reply(doc.trim());
        } catch (err) {
            logger.error("[AUTOFIX ERROR]", err);
            return reply(`❌ *Erro durante o auto-reparo:* ${err.message}`);
        }
    }
};

