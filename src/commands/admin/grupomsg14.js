/**
 * Comando .grupomsg14 — Comunicação e gerenciamento de avisos de grupo #14: .grupomsg14
 * Categoria: admin | Subcategoria: Mensagens & Grupos
 */

module.exports = {
    name: "grupomsg14",
    aliases: ["gmsg14","gmsg-14"],
    category: "admin",
    subcategory: "Mensagens & Grupos",
    description: "Comunicação e gerenciamento de avisos de grupo #14: .grupomsg14",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📣 *SISTEMA DE MENSAGENS E GRUPOS*\n\nControle de transmissões internas, notificações e agendamento.\n\n▫️ *Identificador:* #14\n▫️ *Categoria:* ADMIN / Mensagens & Grupos\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.grupomsg14` para consultar métricas e dados.";
        return reply(doc);
    }
};
