/**
 * Comando .replacespaces — Substitui espaços por um caractere: .replacespaces <char> <texto>
 */
module.exports = {
    name: "replacespaces",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Substitui espaços por um caractere: .replacespaces <char> <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.replacespaces <char> <texto>`\nEx: `.replacespaces _ Meliodas Pecado da Ira`");
            const ch = args[0];
            const text = args.slice(1).join(" ");
            return reply(`🔤 *Resultado:*\n${text.split(" ").join(ch)}`);
        }
};
