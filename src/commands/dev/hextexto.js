/**
 * Comando .hextexto — converte texto ↔ hexadecimal.
 */
module.exports = {
    name: 'hextexto',
    aliases: ['texthex', 'hexto', 'hexconv'],
    category: 'dev',
    subcategory: 'Ferramentas',
    description: 'Converte texto ↔ hexadecimal (ex.: .hextexto Ola / .hextexto 4f6c61)',
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => {
        const input = (text || (args || []).join(' ')).trim()
        if (!input) return reply('🔣 *Hex* — Uso: `.hextexto Ola` ou `.hextexto 4f6c61`')
        const semEspaco = input.replace(/\s+/g, '')
        if (/^[0-9a-fA-F]+$/.test(semEspaco) && semEspaco.length % 2 === 0 && semEspaco.length >= 2) {
            try {
                const dec = Buffer.from(semEspaco, 'hex').toString('utf8')
                if (dec && /\S/.test(dec)) return reply(`🔣 *Decodificado:*\n${dec}`)
            } catch (_) {}
        }
        const hex = Buffer.from(input, 'utf8').toString('hex')
        return reply(`🔣 *Hexadecimal:*\n${hex}`)
    }
}
