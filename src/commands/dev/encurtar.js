/**
 * MeliodasBot — Comando .encurtar
 * Encurtador resiliente de links e URLs com múltiplos provedores em cascata
 */

const shortenerService = require('../../services/shortenerService');

module.exports = {
    name: "encurtar",
    aliases: ["shortlink", "isgd", "tinylink", "encurtador", "shorturl"],
    category: "dev",
    description: "Encurta URLs longas gerando links curtos e seguros",
    execute: async ({ args, text, reply, quotedMsg }) => {
        // Tenta pegar a URL dos argumentos ou do texto da mensagem citada
        let input = (args && args.length > 0) ? args.join(' ').trim() : '';
        if (!input && quotedMsg && quotedMsg.text) {
            input = quotedMsg.text.trim();
        }

        if (!input) {
            return reply(
                "╔══════════════════════════════╗\n" +
                "║      🔗 *ENCURTADOR DE LINKS* 🔗   ║\n" +
                "╚══════════════════════════════╝\n\n" +
                "📌 *Como Usar:*\n" +
                "• Digite: `.encurtar <link>`\n" +
                "• Ou responda a uma mensagem com link usando `.encurtar`\n\n" +
                "👉 *Exemplo:* `.encurtar https://open.spotify.com/track/...`\n" +
                "👉 *Exemplo:* `.encurtar google.com`"
            );
        }

        // Extrai URL via regex se houver texto ao redor
        const urlMatch = input.match(/https?:\/\/[^\s]+/) || input.match(/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
        let targetUrl = urlMatch ? urlMatch[0] : input;

        // Se não tiver protocolo, adiciona https://
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            const result = await shortenerService.shortenUrl(targetUrl);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║      🔗 *LINK ENCURTADO* 🔗      ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✅ *Link encurtado com sucesso!*\n\n`;
            doc += `╭━〔 🌐 *DETALHES DO LINK* 〕━⬣\n`;
            doc += `┃ 🌐 *Original:* ${targetUrl.slice(0, 60)}${targetUrl.length > 60 ? "..." : ""}\n`;
            doc += `┃ ✨ *Link Curto:* ${result.shortUrl}\n`;
            doc += `┃ 📋 *Puro p/ Copiar:* \`${result.shortUrl}\`\n`;
            doc += `┃ ⚡ *Provedor:* ${result.provider}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `🚀 _Link pronto e seguro para compartilhamento!_`;

            return reply(doc.trim());
        } catch (err) {
            return reply(`❌ *Erro ao encurtar link:* ${err.message || 'Falha temporária nos serviços de encurtamento.'}`);
        }
    }
};
