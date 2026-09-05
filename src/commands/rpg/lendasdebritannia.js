/**
 * Comando .lendasdebritannia — Narra a grande crônica da Guerra Santa e o destino de Britannia: .lendasdebritannia
 */
module.exports = {
    name: "lendasdebritannia",
    aliases: [],
    category: "rpg",
    subcategory: "Crônicas",
    description: "Narra a grande crônica da Guerra Santa e o destino de Britannia: .lendasdebritannia",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply(`📖⚔️ *CRÔNICAS ANCESTRAIS DE BRITANNIA*\n\n"Há três mil anos, a guerra entre as Deusas e os Demônios devastou as terras férteis da Britânia.\nQuatro raças uniram suas forças sob a Luz para selar a Escuridão Abissal.\nMas quando o selo se rompeu, coube aos Sete Pecados Capitais erguerem suas lâminas para proteger os mortais!\nComandados por Meliodas, o Pecado da Ira do Dragão, a lenda ecoa pela eternidade!"`);
        }
};
