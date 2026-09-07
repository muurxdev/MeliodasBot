/**
 * Comando .grupomsg26 — Comunicação e gerenciamento de avisos de grupo #26: .grupomsg26
 * Categoria: admin | Subcategoria: Mensagens & Grupos
 */

module.exports = {
    name: "grupomsg26",
    aliases: ["gmsg26","gmsg-26"],
    category: "admin",
    subcategory: "Mensagens & Grupos",
    description: "Comunicação e gerenciamento de avisos de grupo #26: .grupomsg26",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📣 *SISTEMA DE MENSAGENS E GRUPOS*\n\nControle de transmissões internas, notificações e agendamento.\n\n▫️ *Identificador:* #26\n▫️ *Categoria:* ADMIN / Mensagens & Grupos\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.grupomsg26` para consultar métricas e dados.";
        return reply(doc);
    }
};
