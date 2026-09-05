/**
 * Comando .binaryxor — Operação lógica XOR bit a bit: .binaryxor <num1> <num2>
 */
module.exports = {
    name: "binaryxor",
    aliases: [],
    category: "dev",
    subcategory: "Bits",
    description: "Operação lógica XOR bit a bit: .binaryxor <num1> <num2>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.binaryxor <num1> <num2>`");
            const a = parseInt(args[0]), b = parseInt(args[1]);
            const res = a ^ b;
            return reply(`⚡ *Bitwise XOR:*\n${a} ^ ${b} = *${res}* (Binário: ${res.toString(2)})`);
        }
};
