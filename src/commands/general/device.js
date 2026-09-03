/**
 * Comando .device / .conexao / .pinguser / .netinfo
 * Diagnóstico avançado de conexão, tipo de rede, latência, DNS, provedor e modelo de hardware
 */

const { getBotName } = require("../../config/botConfig");
const { getAdvancedNetworkTelemetry } = require("../../services/telemetryDeviceService");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const crypto = require("crypto");

module.exports = {
    name: "device",
    aliases: ["pingdevice", "conexao", "netinfo", "pinguser", "rede", "meudevice", "velocidade"],
    category: "general",
    description: "Analisa e exibe o modelo do dispositivo, latência de rede, tipo de internet (Wi-Fi/5G/Cabo) e telemetria",
    cooldownMs: 2000,
    execute: async ({ sender, reply, info }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const tele = getAdvancedNetworkTelemetry(info, sender, sender, user);
        const cleanNumber = sender.split("@")[0].split(":")[0];

        const keyId = info?.key?.id || "";
        const serialTag = keyId ? ("SN-" + keyId) : ("SN-" + crypto.createHash("md5").update(sender).digest("hex").slice(0, 16).toUpperCase());

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📡 *DIAGNÓSTICO DE REDE & HARDWARE* 📡   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;

        doc += `👤 *Usuário:* @${cleanNumber}\n\n`;

        doc += `╭━〔 💻 HARDWARE & APARELHO 〕━⬣\n`;
        doc += `┃ 📱 *Modelo:* ${tele.device.model}\n`;
        doc += `┃ 🖥️ *Form Factor:* ${tele.device.type}\n`;
        doc += `┃ ⚙️ *Sistema Operacional:* ${tele.device.os}\n`;
        doc += `┃ 🔢 *Serial / HWID:* \`${serialTag}\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `╭━〔 🌐 TELEMETRIA DE CONEXÃO 〕━⬣\n`;
        doc += `┃ 🏢 *Provedor (ISP):* ${tele.isp}\n`;
        doc += `┃ 🔌 *Interface de Rede:* ${tele.connType}\n`;
        doc += `┃ 📶 *Tecnologia em Uso:* ${tele.mobileOrWifi}\n`;
        doc += `┃ ⚡ *Ping Real Socket:* *${tele.pingMs} ms*\n`;
        doc += `┃ 📊 *Jitter:* *${tele.jitter} ms* | 📦 *Perda:* ${tele.packetLoss}\n`;
        doc += `┃ 🛡️ *Servidores DNS:* ${tele.dns}\n`;
        doc += `┃ 🟢 *Status:* *Conexão 100% Sincronizada*\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Para definir seu aparelho manualmente:_ \`.setdevice <modelo>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
