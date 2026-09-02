/**
 * MeliodasBot — Comando .sorteio
 * Sorteia aleatoriamente um ou mais membros do grupo
 */

module.exports = {
    name: "sorteio",
    aliases: ["sortear", "escolhermembro", "roletasorte"],
    category: "fun",
    description: "Sorteia aleatoriamente um membro participante do grupo",
    groupOnly: true,
    execute: async ({ client, from, text, reply }) => {
        try {
            const meta = await client.groupMetadata(from);
            const participants = meta.participants || [];

            if (participants.length === 0) {
                return reply("❌ *Não há participantes suficientes para realizar um sorteio.*");
            }

            const chosen = participants[Math.floor(Math.random() * participants.length)];
            const chosenJid = chosen.id || chosen.jid;
            const chosenNum = chosenJid.split("@")[0].split(":")[0];
            const motivo = (text && text.trim()) || "Sorteio Geral da Comunidade";

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║       🎉 *SORTEIO DO GRUPO* 🎉   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📜 *Motivo:* ${motivo}\n`;
            doc += `👥 *Total de Concorrentes:* ${participants.length} membros\n\n`;
            doc += `🏆 *O GRANDE VENCEDOR É:* 👑 @${chosenNum} 👑\n\n`;
            doc += `✨ _Parabéns ao ganhador do sorteio!_`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [chosenJid]
            });
        } catch (err) {
            return reply("❌ *Erro ao realizar sorteio:* " + err.message);
        }
    }
};

