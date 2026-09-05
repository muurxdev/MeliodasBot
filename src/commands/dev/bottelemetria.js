/**
 * Comando .bottelemetria — Exibe telemetria avançada de processamento e recursos da VPS: .bottelemetria
 */
module.exports = {
    name: "bottelemetria",
    aliases: [],
    category: "dev",
    subcategory: "Telemetria",
    description: "Exibe telemetria avançada de processamento e recursos da VPS: .bottelemetria",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const os = require("os");
            const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const memTotal = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
            const uptime = Math.floor(process.uptime());
            const hrs = Math.floor(uptime / 3600);
            const mins = Math.floor((uptime % 3600) / 60);
            const secs = uptime % 60;
            return reply(`🤖⚡ *TELEMETRIA DO SISTEMA MELIODAS BOT XP*\n\n▫️ *Status:* Operacional e Online\n▫️ *Meta Atingida:* 1.000 Comandos Ativos\n▫️ *Uptime do Node:* ${hrs}h ${mins}m ${secs}s\n▫️ *Heap Memory:* ${memUsed} MB / ${memTotal} MB\n▫️ *Plataforma:* ${os.platform()} (${os.arch()})\n▫️ *CPUs:* ${os.cpus().length} núcleos disponíveis\n\n🛡️ *Pronto para servir a Britânia com máxima estabilidade!*`);
        }
};
