/**
 * Comando .deldono / .removedono
 * Remove ou desativa um Dono da hierarquia militar seguindo autorização rígida
 */

const { removeOwner, canModifyOwner } = require("../../services/ownerService");

module.exports = {
    name: "deldono",
    aliases: ["delowner", "removerdono", "rebaixardono", "removedono"],
    category: "owner",
    description: "Remove um Dono da hierarquia militar seguindo a hierarquia rígida",
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ args, reply, sender, isOwner }) => {
        if (args.length === 0) {
            return reply("❌ Informe a patente do Dono a ser removido.\n\n📌 *Exemplo:* \`.deldono soldado\` ou \`.deldono cabo\`\n🎖️ *Patentes:* Capitão, Tenente, Sargento, Cabo, Soldado");
        }

        const cargo = args[0].toLowerCase();
        const check = canModifyOwner(sender, cargo);
        if (!check.allowed) {
            return reply(check.reason);
        }

        const removed = removeOwner(cargo);
        if (!removed) {
            return reply("❌ Falha ao remover a patente \`" + cargo + "\`.");
        }

        return reply("🗑️ *DONO REMOVIDO COM SUCESSO!*\n\n🎖️ *Patente:* " + removed.rank + "\n📌 *Status:* Vaga liberada e desativada da hierarquia oficial.");
    }
};
