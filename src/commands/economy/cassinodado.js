/**
 * Comando .cassinodado — Rola dados contra a mesa da taverna: .cassinodado <palpite 2-12> <aposta>
 */
module.exports = {
    name: "cassinodado",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Rola dados contra a mesa da taverna: .cassinodado <palpite 2-12> <aposta>",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const palpite = parseInt(args[0]);
            const aposta = parseInt(args[1]) || 50;
            if (isNaN(palpite) || palpite < 2 || palpite > 12) return reply("🎲 *Cassino dos Dados*\nUso: `.cassinodado <palpite de 2 a 12> [aposta]`\nEx: `.cassinodado 7 100`");
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const total = d1 + d2;
            let msg = `🎲 *DADOS DA TAVERNA*\n\nDados caídos: [${d1}] e [${d2}] ➔ Total: *${total}*\nSeu palpite: *${palpite}*\n\n`;
            if (palpite === total) {
                msg += `🎉 *ACERTO EXATO!* Você faturou 💰 *${aposta * 6} moedas* (6x)!`;
            } else {
                msg += `Não foi dessa vez! A casa recolheu a aposta.`;
            }
            return reply(msg);
        }
};
