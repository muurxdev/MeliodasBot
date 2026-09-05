/**
 * Comando .apostarcorujas — Aposta no voo veloz das corujas mensageiras: .apostarcorujas [1-4]
 */
module.exports = {
    name: "apostarcorujas",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Aposta no voo veloz das corujas mensageiras: .apostarcorujas [1-4]",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const escolha = parseInt(args[0]) || 1;
            const vencedora = Math.floor(Math.random() * 4) + 1;
            const corujas = ["Coruja Branca de Liones", "Coruja Sombria de Camelot", "Coruja Real de Vaizel", "Coruja Mística de Istar"];
            let msg = `🦉 *CORRIDA DAS CORUJAS MENSAGEIRAS*\n\n▫️ Vencedora: *${corujas[vencedora - 1]}* (Nº ${vencedora})\n`;
            if (escolha === vencedora) {
                msg += `🎉 *Sua coruja cruzou a linha em primeiro lugar!* Prêmio de 💰 1.200 moedas recebido!`;
            } else {
                msg += `Sua coruja se distraiu pelo caminho... Você perdeu a aposta.`;
            }
            return reply(msg);
        }
};
