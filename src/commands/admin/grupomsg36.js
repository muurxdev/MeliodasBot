/**
 * Comando .grupomsg36 — Comunicação e gerenciamento de avisos de grupo #36: .grupomsg36
 * Categoria: admin | Subcategoria: Mensagens & Grupos
 */

module.exports = {
    name: "grupomsg36",
    aliases: ["gmsg36","gmsg-36"],
    category: "admin",
    subcategory: "Mensagens & Grupos",
    description: "Comunicação e gerenciamento de avisos de grupo #36: .grupomsg36",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📣 *SISTEMA DE MENSAGENS E GRUPOS*\n\nControle de transmissões internas, notificações e agendamento.\n\n▫️ *Identificador:* #36\n▫️ *Categoria:* ADMIN / Mensagens & Grupos\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.grupomsg36` para consultar métricas e dados.";
        return reply(doc);
    }
};
