/**
 * Comando .ipinfo
 * Consulta dados geográficos, ISP e ASN de endereços IP ou domínios
 */

module.exports = {
    name: "ipinfo",
    aliases: ["whois", "lookupip", "ip", "rastrearip"],
    category: "dev",
    description: "Consulta informações geográficas, operadora e localização de um IP ou domínio",
    execute: async ({ args, text, reply }) => {
        const query = (args && args[0]) ? args[0].trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "") : "";

        if (!query) {
            return reply("🌐 *Uso:* Digite `.ipinfo <ip ou dominio>`\n👉 Exemplo: `.ipinfo 1.1.1.1` ou `.ipinfo google.com`");
        }

        try {
            const url = `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
            const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
            const data = await res.json();

            if (data.status !== "success") {
                return reply(`❌ *Falha na consulta:* ${data.message || "IP ou domínio inválido."}`);
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║       🌐 *IP & REDE INFO* 🌐     ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📍 *Host / IP:* ${data.query}\n`;
            doc += `🌍 *País:* ${data.country}\n`;
            doc += `🏙️ *Cidade / Região:* ${data.city}, ${data.regionName}\n`;
            doc += `📮 *CEP / Zip:* ${data.zip || "—"}\n`;
            doc += `🧭 *Coordenadas:* ${data.lat}, ${data.lon}\n`;
            doc += `⏰ *Fuso Horário:* ${data.timezone}\n`;
            doc += `🏢 *Provedor / ISP:* ${data.isp}\n`;
            doc += `🏷️ *ASN:* ${data.as || "—"}\n\n`;
            doc += `🛡️ _Auditoria de infraestrutura de rede._`;

            return reply(doc.trim());
        } catch (err) {
            return reply("❌ *Erro ao consultar IP:* " + err.message);
        }
    }
};

