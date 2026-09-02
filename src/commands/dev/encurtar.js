/**
 * MeliodasBot — Comando .encurtar
 * Encurtador de links e URLs via is.gd
 */

module.exports = {
    name: "encurtar",
    aliases: ["shortlink", "isgd", "tinylink", "encurtador"],
    category: "dev",
    description: "Encurta URLs longas gerando links curtos e seguros",
    execute: async ({ args, text, reply }) => {
        let targetUrl = (args && args[0]) ? args[0].trim() : "";

        if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
            return reply("🔗 *Uso:* Digite `.encurtar <link completo>`\n👉 Exemplo: `.encurtar https://google.com`");
        }

        try {
            const endpoint = `https://is.gd/create.php?format=json&url=${encodeURIComponent(targetUrl)}`;
            const res = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
            const data = await res.json();

            if (data.errorcode || !data.shorturl) {
                return reply(`❌ *Erro ao encurtar link:* ${data.errormessage || "Link inválido."}`);
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║      🔗 *LINK ENCURTADO* 🔗      ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `🌐 *Link Original:* ${targetUrl.slice(0, 50)}${targetUrl.length > 50 ? "..." : ""}\n`;
            doc += `✨ *Link Curto:* ${data.shorturl}\n\n`;
            doc += `🚀 _Link pronto para compartilhamento!_`;

            return reply(doc.trim());
        } catch (err) {
            return reply("❌ *Erro no encurtador:* " + err.message);
        }
    }
};

