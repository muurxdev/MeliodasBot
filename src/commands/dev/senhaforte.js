/**
 * Comando .senhaforte — gera uma senha forte aleatória.
 * Uso: .senhaforte [tamanho=16]
 */
const crypto = require('crypto')

module.exports = {
    name: 'senhaforte',
    aliases: ['senha', 'gerarpass'],
    category: 'dev',
    subcategory: 'Ferramentas',
    description: 'Gera uma senha forte aleatória (ex.: .senhaforte 20)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        let len = parseInt(args[0], 10)
        if (isNaN(len) || len < 6) len = 16
        len = Math.min(len, 128)
        const sets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?-_'
        let pass = ''
        const bytes = crypto.randomBytes(len)
        for (let i = 0; i < len; i++) pass += sets[bytes[i] % sets.length]
        const forca = len >= 20 ? '🟢 Muito forte' : len >= 12 ? '🟡 Forte' : '🟠 Média'
        return reply(`🔐 *SENHA GERADA* (${len} caracteres)\n\n\`${pass}\`\n\n💪 Força: ${forca}\n⚠️ _Guarde num gerenciador de senhas._`)
    }
}
