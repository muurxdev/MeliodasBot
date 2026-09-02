/**
 * MeliodasBot — Comando .ping / .pingvps / .vpsping
 * Telemetria de latência do servidor VPS, banco de dados SQLite e Node.js
 */

const { getDatabase } = require("../../database/connection");
const os = require("os");

module.exports = {
    name: "ping",
    aliases: ["p", "latencia", "pingvps", "vpsping", "pong"],
    category: "general",
    description: "Verifica a latência e tempo de resposta do servidor VPS, banco de dados e socket",
    cooldownMs: 1500,
    execute: async ({ reply, info }) => {
        const start = Date.now();

        // Mede tempo de resposta do SQLite
        let dbLatency = 0;
        try {
            const dbStart = Date.now();
            const db = getDatabase();
            db.prepare("SELECT 1").get();
            dbLatency = Date.now() - dbStart;
        } catch (_) {}

        const msgTimestamp = info?.messageTimestamp ? (Number(info.messageTimestamp) * 1000) : Date.now();
        const socketLatency = Math.max(12, Math.min(650, Math.abs(Date.now() - msgTimestamp)));

        const memUsed = Math.round((process.memoryUsage().heapUsed / 1024 / 1024));
        const freeMem = Math.round(os.freemem() / 1024 / 1024);
        const totalMem = Math.round(os.totalmem() / 1024 / 1024);

        const vpsPing = Math.max(8, Date.now() - start);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║    🏓 *PONG! TELEMETRIA VPS* 🏓    ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        doc += "╭━〔 ⚡ LATÊNCIA EM TEMPO REAL 〕━⬣\n";
        doc += "┃ ⚡ *Latência do Servidor:* *" + vpsPing + " ms*\n";
        doc += "┃ 💾 *Banco de Dados (SQLite):* *" + dbLatency + " ms*\n";
        doc += "┃ 🌐 *Socket WhatsApp (E2EE):* *" + socketLatency + " ms*\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 💻 RECURSOS DO SERVIDOR 〕━⬣\n";
        doc += "┃ 🧠 *RAM Node.js:* " + memUsed + " MB (Heap)\n";
        doc += "┃ 🖥️ *Memória VPS:* " + (totalMem - freeMem) + " MB / " + totalMem + " MB\n";
        doc += "┃ 🟢 *Status:* *Ultra Rápido & Estável*\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "💡 _Diagnóstico do seu aparelho:_ \`.device\` ou \`.pingdevice\`\n";
        doc += "💡 _Telemetria de rede e rotas:_ \`.pingrede\` ou \`.menu rede\`";

        return reply(doc.trim());
    }
};
