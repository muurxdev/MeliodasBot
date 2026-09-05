/**
 * Comando .genuuidv4 — Gera identificador UUID v4 único: .genuuidv4
 */
module.exports = {
    name: "genuuidv4",
    aliases: [],
    category: "dev",
    subcategory: "Dev",
    description: "Gera identificador UUID v4 único: .genuuidv4",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const crypto = require("crypto");
            const uuid = crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return reply(`🆔 *UUID v4:*\n\`${uuid}\``);
        }
};
