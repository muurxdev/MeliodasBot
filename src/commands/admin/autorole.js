/**
 * Comando .autorole
 * Configura a atribuição automática de cargos e saudações aos novatos
 */

module.exports = {
    name: "autorole",
    aliases: ["cargoautomatico", "autocargo", "setautorole"],
    category: "admin",
    description: "Configura a atribuição automática de cargos e saudações aos novatos",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("❌ Funcionalidade em desenvolvimento — auto-role ainda não implementado.");
}
};
