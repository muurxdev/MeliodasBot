/**
 * Comando .ipsubnetcalc — Calcula hosts úteis de máscara CIDR: .ipsubnetcalc <cidr_24_a_30>
 */
module.exports = {
    name: "ipsubnetcalc",
    aliases: [],
    category: "dev",
    subcategory: "Rede",
    description: "Calcula hosts úteis de máscara CIDR: .ipsubnetcalc <cidr_24_a_30>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const cidr = parseInt(args[0]) || 24;
            if (cidr < 8 || cidr > 32) return reply("Uso: `.ipsubnetcalc <8-32>`\nEx: `.ipsubnetcalc 24`");
            const total = Math.pow(2, 32 - cidr);
            const uteis = Math.max(0, total - 2);
            return reply(`🌐 *Cálculo de Sub-rede (/${cidr}):*\n▫️ Total de IPs: ${total.toLocaleString('pt-BR')}\n▫️ Hosts Utilizáveis: *${uteis.toLocaleString('pt-BR')} hosts*`);
        }
};
