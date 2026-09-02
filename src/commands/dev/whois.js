/**
 * MeliodasBot — Comando .whois / .dominio / .consultadominio
 * Consulta de informações de registro WHOIS e DNS de domínios na Web
 */

const { renderCard } = require("../../utils/uiEngine");
const dns = require("dns").promises;

module.exports = {
    name: "whois",
    aliases: ["dominio", "consultadominio", "whois-domain"],
    category: "dev",
    description: "Consulta informações de resolução DNS e disponibilidade de domínios",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        let domain = (args[0] || "").toLowerCase().trim();
        domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

        if (!domain || !domain.includes(".")) {
            return reply("❌ Informe um domínio válido para consultar (ex: `.whois google.com` ou `.whois github.com`).");
        }

        try {
            const [aRecords, nsRecords] = await Promise.allSettled([
                dns.resolve4(domain),
                dns.resolveNs(domain)
            ]);

            const ips = aRecords.status === "fulfilled" ? aRecords.value.join(", ") : "Não resolvido";
            const ns = nsRecords.status === "fulfilled" ? nsRecords.value.slice(0, 3).join(", ") : "Desconhecido";

            const card = renderCard({
                title: "CONSULTA DE DOMÍNIO & WHOIS",
                icon: "🌐",
                subtitle: `🔍 *Domínio Alvo:* ${domain}`,
                sections: [
                    {
                        title: "REGISTROS DNS PRINCIPAIS",
                        icon: "📡",
                        fields: [
                            { label: "Endereço IP (A)", value: ips, icon: "💻" },
                            { label: "Servidores DNS (NS)", value: ns, icon: "🛡️" },
                            { label: "Status de Rede", value: aRecords.status === "fulfilled" ? "🟢 *ONLINE / ATIVO*" : "🔴 *INACESSÍVEL*", icon: "⚡" }
                        ]
                    }
                ],
                tip: "Use .dns <dominio> para ver registros TXT, MX e SOA completos!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        } catch (err) {
            return reply(`❌ Erro ao consultar domínio: ${err.message}`);
        }
    }
};

