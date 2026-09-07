/**
 * Comando .grupomsg8 — Comunicação e gerenciamento de avisos de grupo #8: .grupomsg8
 * Categoria: admin | Subcategoria: Mensagens & Grupos
 */

module.exports = {
    name: "grupomsg8",
    aliases: ["gmsg8","gmsg-8"],
    category: "admin",
    subcategory: "Mensagens & Grupos",
    description: "Comunicação e gerenciamento de avisos de grupo #8: .grupomsg8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📣 *SISTEMA DE MENSAGENS E GRUPOS*\n\nControle de transmissões internas, notificações e agendamento.\n\n▫️ *Identificador:* #8\n▫️ *Categoria:* ADMIN / Mensagens & Grupos\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.grupomsg8` para consultar métricas e dados.";
        return reply(doc);
    }
};
