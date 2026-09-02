/**
 * MeliodasBot — Comando .curlemu / .requester / .httptest
 * Emulador de requisições HTTP curl rápidas para testar endpoints
 */

const { renderCard } = require("../../utils/uiEngine");
const axios = require("axios");

module.exports = {
    name: "curlemu",
    aliases: ["requester", "httptest", "curl", "testapi"],
    category: "dev",
    description: "Executa uma requisição HTTP rápida para testar status e tempo de resposta",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        let targetUrl = (args[0] || "").trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        if (!targetUrl.includes(".")) {
            return reply("❌ Informe uma URL válida para testar.\n\n👉 *Exemplo:* `.curlemu https://api.github.com`");
        }

        try {
            const start = Date.now();
            const res = await axios.get(targetUrl, { timeout: 8000, validateStatus: () => true });
            const duracao = Date.now() - start;

            const card = renderCard({
                title: "EMULADOR DE REQUISIÇÃO HTTP (CURL)",
                icon: "🌐",
                subtitle: `🔗 *URL:* ${targetUrl}`,
                sections: [
                    {
                        title: "RESPOSTA DO SERVIDOR",
                        icon: "📡",
                        fields: [
                            { label: "Status Code", value: `\`HTTP ${res.status} ${res.statusText || ""}\``, icon: "🔢" },
                            { label: "Tempo de Resposta", value: `${duracao} ms`, icon: "⏱️" },
                            { label: "Tipo de Conteúdo", value: res.headers["content-type"] || "Desconhecido", icon: "📑" }
                        ]
                    }
                ],
                tip: "Use para validar rapidamente se uma API externa ou webhook está online!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        } catch (err) {
            return reply(`❌ *Falha ao conectar na URL:* ${err.message}`);
        }
    }
};

