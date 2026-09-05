/**
 * Comando .abrirbaureal — Abre um Baú Real com chave dourada: .abrirbaureal
 */
module.exports = {
    name: "abrirbaureal",
    aliases: [],
    category: "economy",
    subcategory: "Recompensas",
    description: "Abre um Baú Real com chave dourada: .abrirbaureal",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const drops = [
                "500 Moedas de Ouro + Poção de Vida Pequena",
                "1.200 Moedas de Ouro + Anel de Prata Encantado",
                "3.000 Moedas de Ouro + Fragmento de Aço Sagrado",
                "Chave do Purgatório + 200 Moedas",
                "Armadura de Malha Antiga + 800 Moedas"
            ];
            const d = drops[Math.floor(Math.random() * drops.length)];
            return reply(`📦✨ *ABRINDO BAÚ REAL...*\n\nA fechadura dourada estalou!\n🎉 *Recompensas encontradas:* ${d}`);
        }
};
