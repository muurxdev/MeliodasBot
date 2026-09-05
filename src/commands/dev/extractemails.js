/**
 * Comando .extractemails — Extrai endereços de email de um texto: .extractemails <texto>
 */
module.exports = {
    name: "extractemails",
    aliases: [],
    category: "dev",
    subcategory: "Regex",
    description: "Extrai endereços de email de um texto: .extractemails <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.extractemails <texto>`");
            const emails = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            if (!emails.length) return reply("❌ Nenhum e-mail encontrado no texto.");
            return reply(`📧 *E-mails encontrados (${emails.length}):*\n${emails.join("\n")}`);
        }
};
