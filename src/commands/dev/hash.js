/**
 * Comando .hash
 * Gerador de hashes criptográficos (MD5, SHA1, SHA256, SHA512)
 */

const { generateHash } = require('../../services/devService')

module.exports = {
    name: 'hash',
    aliases: ['sha256', 'md5', 'sha512', 'sha1'],
    category: 'dev',
    description: 'Gera hashes criptográficos seguros a partir de uma string de texto',
    execute: async ({ commandName, command, args = [], text, reply }) => {
        const cmdUsed = (commandName || command || 'hash').toLowerCase()
        let algo = 'sha256'
        let input = text

        if (['sha256', 'md5', 'sha512', 'sha1'].includes(cmdUsed)) {
            algo = cmdUsed
        } else if (['md5', 'sha1', 'sha256', 'sha512'].includes(args[0]?.toLowerCase())) {
            algo = args[0].toLowerCase()
            input = args.slice(1).join(' ')
        }

        if (!input) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║    💡 *COMO USAR O COMANDO* 💡    ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Comando:* \`.hash\` (ou \`.md5\`, \`.sha256\`, \`.sha512\`)\n`
            doc += `📖 *Descrição:* Gera hashes criptográficos seguros a partir de um texto.\n\n`
            doc += `📝 *Exemplos de Uso:*\n`
            doc += `👉 \`.hash sha256 minha_senha_secreta\`\n`
            doc += `👉 \`.md5 texto_aqui\`\n`
            doc += `👉 \`.sha512 payload_de_dados\`\n\n`
            doc += `💡 *Dica:* Escolha o algoritmo ou use o alias direto!`
            return reply(doc.trim())
        }

        try {
            const hashResult = generateHash(algo, input)
            await reply(`🔐 *HASH CRIPTOGRÁFICO*\n\n⚙️ *Algoritmo:* ${algo.toUpperCase()}\n📝 *Entrada:* \`${input.slice(0, 50)}\`\n🔑 *Digest (Hex):*\n\`\`\`\n${hashResult}\n\`\`\``)
        } catch (err) {
            await reply(`❌ *Erro:* ${err.message}`)
        }
    }
}

