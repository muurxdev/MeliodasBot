/**
 * Comando .loremwords — Gera N palavras de texto de preenchimento: .loremwords [qtd=10]
 */
module.exports = {
    name: "loremwords",
    aliases: [],
    category: "dev",
    subcategory: "Dev",
    description: "Gera N palavras de texto de preenchimento: .loremwords [qtd=10]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const count = Math.min(100, Math.max(1, parseInt(args[0]) || 10));
            const dict = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"];
            const words = [];
            for (let i = 0; i < count; i++) words.push(dict[i % dict.length]);
            return reply(`📝 *${count} Palavras Lorem:*\n${words.join(" ")}.`);
        }
};
