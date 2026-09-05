/**
 * Comando .jwtinspect — Inspeciona cabeçalho e payload de um token JWT: .jwtinspect <token>
 */
module.exports = {
    name: "jwtinspect",
    aliases: [],
    category: "dev",
    subcategory: "Dev",
    description: "Inspeciona cabeçalho e payload de um token JWT: .jwtinspect <token>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const token = args[0] || "";
            const parts = token.split(".");
            if (parts.length !== 3) return reply("❌ Token JWT inválido. Formato esperado: header.payload.signature");
            try {
                const h = JSON.parse(Buffer.from(parts[0], "base64").toString("utf-8"));
                const p = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
                return reply(`🔐 *JWT Decodificado:*\n\nHeader:\n\`\`\`json\n${JSON.stringify(h, null, 2)}\n\`\`\`\n\nPayload:\n\`\`\`json\n${JSON.stringify(p, null, 2)}\n\`\`\``);
            } catch (e) {
                return reply("❌ Erro ao decodificar partes base64 do JWT.");
            }
        }
};
