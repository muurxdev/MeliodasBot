/**
 * Comando .dnsrecords
 * Explica os tipos de registros DNS (A, AAAA, CNAME, MX, TXT, SOA)
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "dnsrecords",
    aliases: ["registrosdns", "consultatxt", "consultamx"],
    category: "dev",
    description: "Explica os tipos de registros DNS (A, AAAA, CNAME, MX, TXT, SOA)",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "DICIONÁRIO DE REGISTROS DNS",
        icon: "📡",
        subtitle: "🌐 *Domain Name System*",
        sections: [
            {
                title: "TIPOS DE REGISTROS",
                icon: "📜",
                fields: [
                    "• **A:** Aponta domínio para endereço IPv4",
                    "• **AAAA:** Aponta domínio para endereço IPv6",
                    "• **CNAME:** Apelido/Redirecionamento para outro domínio",
                    "• **MX:** Servidores de recebimento de e-mails",
                    "• **TXT:** Validações de domínio, SPF, DKIM e DMARC"
                ]
            }
        ],
        tip: "Use .dns <dominio> para consultar registros reais!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
