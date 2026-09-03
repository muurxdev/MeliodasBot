/**
 * Loja de Classes e Classes Lendárias
 */

module.exports = {
    name: 'classeshop',
    aliases: ['lojaclasses', 'trocarclasse'],
    category: 'rpg',
    description: 'Loja para compra e troca de classes com coins e visualização de classes lendárias',
    execute: async ({ reply }) => {
        let loja = `╔══════════════════════════════╗\n`
        loja += `║    🏪 *LOJA DE CLASSES* 🏪    ║\n`
        loja += `╚══════════════════════════════╝\n\n`

        loja += `╭━〔 🛡️ CLASSES BÁSICAS (COINS) 〕━⬣\n`
        loja += `┃ 🧙 *Arquimago do Código* — 💰 800 coins\n┃   👉 \`.comprarclasse arquimago\`\n\n`
        loja += `┃ 🛡️ *Guardião do Servidor* — 💰 800 coins\n┃   👉 \`.comprarclasse guardiao\`\n\n`
        loja += `┃ ⚡ *Bug Hunter* — 💰 1.000 coins\n┃   👉 \`.comprarclasse bughunter\`\n\n`
        loja += `┃ ☁️ *Mestre da Nuvem* — 💰 1.000 coins\n┃   👉 \`.comprarclasse nuvem\`\n\n`
        loja += `┃ 🤖 *Engenheiro de IA* — 💰 1.500 coins\n┃   👉 \`.comprarclasse ia\`\n\n`
        loja += `┃ 🕶️ *Hacker Fantasma* — 💰 1.500 coins\n┃   👉 \`.comprarclasse hacker\`\n\n`
        loja += `┃ 🔥 *Dev Full Stack* — 💰 2.000 coins\n┃   👉 \`.comprarclasse fullstack\`\n\n`
        loja += `┃ 💀 *Necromante dos Bugs* — 💰 2.500 coins\n┃   👉 \`.comprarclasse necromante\`\n`
        loja += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        loja += `╭━〔 👑 CLASSES LENDÁRIAS SUPREMAS 〕━⬣\n`
        loja += `┃ 👑 *Meliodas Modo Assalto (Rei Demônio)*\n┃   📌 Nível 80+, 100 Bosses, 50 Duelos, Loots Supremos\n\n`
        loja += `┃ 🐉 *Pecado da Ira do Dragão*\n┃   📌 Nível 60+, 30 Bosses, Loots Dracônicos\n\n`
        loja += `┃ 🌌 *Rei do Void* | ⚔️ *Deus Full Stack* | 💀 *Rei dos Bugs*\n`
        loja += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        loja += `💡 _Para ver todas as lendárias e requisitos:_ \`.lendaria lista\`\n`
        loja += `💡 _Para desbloquear:_ \`.lendaria desbloquear [nome]\``

        return reply(loja.trim())
    }
}