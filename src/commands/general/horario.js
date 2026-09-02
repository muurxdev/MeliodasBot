/**
 * MeliodasBot — Comando .horario / .hora / .time / .fusohorario
 * Relógio mundial em tempo real com conversão de fusos horários e pesquisa de países/cidades
 */

const { getBotName } = require("../../config/botConfig");

const TIMEZONES = [
    { country: "Brasil (Brasília/SP)", flag: "🇧🇷", zone: "America/Sao_Paulo", tag: "brasil" },
    { country: "Portugal (Lisboa)", flag: "🇵🇹", zone: "Europe/Lisbon", tag: "portugal" },
    { country: "Estados Unidos (Nova York)", flag: "🇺🇸", zone: "America/New_York", tag: "eua_ny" },
    { country: "Estados Unidos (Los Angeles)", flag: "🇺🇸", zone: "America/Los_Angeles", tag: "eua_la" },
    { country: "Japão (Tóquio)", flag: "🇯🇵", zone: "Asia/Tokyo", tag: "japao" },
    { country: "Reino Unido (Londres)", flag: "🇬🇧", zone: "Europe/London", tag: "londres" },
    { country: "França (Paris)", flag: "🇫🇷", zone: "Europe/Paris", tag: "franca" },
    { country: "Alemanha (Berlim)", flag: "🇩🇪", zone: "Europe/Berlin", tag: "alemanha" },
    { country: "Rússia (Moscou)", flag: "🇷🇺", zone: "Europe/Moscow", tag: "russia" },
    { country: "Emirados Árabes (Dubai)", flag: "🇦🇪", zone: "Asia/Dubai", tag: "dubai" },
    { country: "China (Pequim)", flag: "🇨🇳", zone: "Asia/Shanghai", tag: "china" },
    { country: "Austrália (Sydney)", flag: "🇦🇺", zone: "Australia/Sydney", tag: "australia" },
    { country: "Argentina (Buenos Aires)", flag: "🇦🇷", zone: "America/Argentina/Buenos_Aires", tag: "argentina" },
    { country: "Espanha (Madri)", flag: "🇪🇸", zone: "Europe/Madrid", tag: "espanha" },
    { country: "Itália (Roma)", flag: "🇮🇹", zone: "Europe/Rome", tag: "italia" },
    { country: "Canadá (Toronto)", flag: "🇨🇦", zone: "America/Toronto", tag: "canada" }
];

function getTimeForZone(zone) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString("pt-BR", { timeZone: zone, day: "2-digit", month: "2-digit", year: "numeric" });
    const hour = parseInt(timeStr.split(":")[0], 10);
    const isDay = hour >= 6 && hour < 18;
    const icon = isDay ? "☀️" : "🌙";
    return { timeStr, dateStr, icon };
}

module.exports = {
    name: "horario",
    aliases: ["hora", "time", "worldtime", "fusohorario", "relogio", "fuso"],
    category: "general",
    description: "Exibe o relógio mundial em tempo real e o horário oficial de países e cidades",
    cooldownMs: 2000,
    execute: async ({ reply, text, args }) => {
        const botName = getBotName();
        const query = (text || "").toLowerCase().trim()
            .replace("ã", "a").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o");

        if (query) {
            const found = TIMEZONES.find(t =>
                t.country.toLowerCase().includes(query) ||
                t.tag.includes(query) ||
                t.zone.toLowerCase().includes(query)
            );

            if (found) {
                const info = getTimeForZone(found.zone);
                let doc = "╔══════════════════════════════╗\n";
                doc += "║    ⏰ *FUSO HORÁRIO OFICIAL* ⏰    ║\n";
                doc += "╚══════════════════════════════╝\n\n";
                doc += "📍 *Localidade:* " + found.flag + " *" + found.country + "*\n\n";
                doc += "╭━〔 🕒 INFORMAÇÕES DE HORÁRIO 〕━⬣\n";
                doc += "┃ ⏰ *Hora Atual:* *" + info.timeStr + "* " + info.icon + "\n";
                doc += "┃ 📅 *Data Local:* *" + info.dateStr + "*\n";
                doc += "┃ 🌐 *Fuso (IANA):* \`" + found.zone + "\`\n";
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
                doc += "👑 *" + botName + "*";
                return reply(doc.trim());
            }
        }

        // Relógio Mundial Geral
        let doc = "╔══════════════════════════════╗\n";
        doc += "║    🌍 *RELÓGIO MUNDIAL* 🌍    ║\n";
        doc += "╚══════════════════════════════╝\n\n";
        doc += "🕒 *Horários oficiais sincronizados em tempo real:*\n\n";

        doc += "╭━〔 🌐 PRINCIPAIS PAÍSES & CIDADES 〕━⬣\n";
        for (const tz of TIMEZONES) {
            const info = getTimeForZone(tz.zone);
            doc += "┃ " + tz.flag + " *" + tz.country + ":* \`" + info.timeStr + "\` " + info.icon + "\n";
        }
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "💡 *Dica:* Digite \`.horario <país ou cidade>\` para consultar uma região específica.\n\n";
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
