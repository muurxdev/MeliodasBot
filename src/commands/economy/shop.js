module.exports = {
    name: 'shop',
    aliases: ['loja'],
    category: 'economy',
    description: 'Exibe a loja de itens e mochilas para desenvolvedores',
    execute: async ({ reply }) => {
        const loja = `╔══════════════════╗
║ 🛒 LOJA DEV 🛒 ║
╚══════════════════╝

1️⃣ 👑 *VIP DEV*
💰 500 coins

2️⃣ ⚛️ *React Master*
💰 1000 coins

3️⃣ 🟢 *Node Wizard*
💰 1500 coins

4️⃣ 🚀 *Full Stack*
💰 2000 coins

5️⃣ 🎒 *Mochila Pequena*
💰 500 coins | 📦 +10 espaços

6️⃣ 🎒 *Mochila Média*
💰 1200 coins | 📦 +25 espaços

7️⃣ 🎒 *Mochila Grande*
💰 2500 coins | 📦 +50 espaços

8️⃣ 🎒 *Mochila Lendária*
💰 5000 coins | 📦 +100 espaços

━━━━━━━━━━━━━━━━━━
🛍️ *Como comprar:*
.buy [nome do item]

*Exemplos:*
• .buy mochila pequena
• .buy vip dev`
        await reply(loja)
    }
}