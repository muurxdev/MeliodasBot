/**
 * Comando .nivelpecado — Mede o peso dos pecados cometidos no reino: .nivelpecado
 */
module.exports = {
    name: "nivelpecado",
    aliases: [],
    category: "profile",
    subcategory: "Status",
    description: "Mede o peso dos pecados cometidos no reino: .nivelpecado",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const p = Math.floor(Math.random() * 7) + 1;
            const pecados = ["Ira", "Inveja", "Ganância", "Preguiça", "Gula", "Luxúria", "Orgulho"];
            return reply(`⚖️ *BALANÇA DOS PECADOS*\nSeu pecado primordial mais marcante hoje: *Pecado da ${pecados[p - 1]}*!`);
        }
};
