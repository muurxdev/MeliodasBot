/**
 * Comando .grupomsg1 — Comunicação e gerenciamento de avisos de grupo #1: .grupomsg1
 * Categoria: admin | Subcategoria: Mensagens & Grupos
 */

module.exports = {
    name: "grupomsg1",
    aliases: ["gmsg1","gmsg-1"],
    category: "admin",
    subcategory: "Mensagens & Grupos",
    description: "Comunicação e gerenciamento de avisos de grupo #1: .grupomsg1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📣 *SISTEMA DE MENSAGENS E GRUPOS*\n\nControle de transmissões internas, notificações e agendamento.\n\n▫️ *Identificador:* #1\n▫️ *Categoria:* ADMIN / Mensagens & Grupos\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.grupomsg1` para consultar métricas e dados.";
        return reply(doc);
    }
};
