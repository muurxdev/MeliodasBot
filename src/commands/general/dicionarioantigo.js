/**
 * Comando .dicionarioantigo — Consulta significado de termos arcanos da antiguidade: .dicionarioantigo <termo>
 */
module.exports = {
    name: "dicionarioantigo",
    aliases: [],
    category: "general",
    subcategory: "Conhecimento",
    description: "Consulta significado de termos arcanos da antiguidade: .dicionarioantigo <termo>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const termo = (args[0] || "").toLowerCase();
            const dict = {
                britannia: "Antiga terra mística onde coexistem humanos, fadas, gigantes, deusas e demônios.",
                purgatorio: "Dimensão extrema de escuridão onde o tempo passa milhares de vezes mais rápido.",
                mandamento: "Fragmento do poder absoluto concedido pelo Rei Demônio aos guerreiros de elite.",
                graca: "Bênção divina primordial dividida pela Suprema Divindade aos Quatro Arcanjos."
            };
            const desc = dict[termo] || "Palavra ancestral guardada nos manuscritos da biblioteca de Merlin.";
            return reply(`📖 *DICIONÁRIO ARCANO*\nTermo: *${termo || "Geral"}*\n▫️ Definição: ${desc}`);
        }
};
