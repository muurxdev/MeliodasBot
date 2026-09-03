/**
 * Comando .json
 * Validador e formatador/minificador de JSON
 */

const { processJson } = require('../../services/devService')

module.exports = {
    name: 'json',
    aliases: ['jsonformat', 'jsonminify', 'jsonval'],
    category: 'dev',
    description: 'Valida, formata ou minifica strings no formato JSON',
    execute: async ({ args, text, reply }) => {
        const sub = args[0]?.toLowerCase()

        if (!text || (!['format', 'formatar', 'minify', 'minificar', 'validate', 'validar'].includes(sub) && args.length < 1)) {
            return reply('❌ Informe o modo e o conteúdo JSON.\n\n📌 *Exemplos:*\n• `.json format {"nome":"Meliodas","versao":2}`\n• `.json minify {"a": 1, "b": 2}`\n• `.json validate {"status": "ok"}`')
        }

        const isMinify = sub === 'minify' || sub === 'minificar'
        const rawJson = ['format', 'formatar', 'minify', 'minificar', 'validate', 'validar'].includes(sub)
            ? args.slice(1).join(' ')
            : text

        if (!rawJson) {
            return reply('❌ Digite ou cole a estrutura JSON a ser processada.')
        }

        try {
            const result = processJson(rawJson, isMinify ? 'minify' : 'format')
            if (sub === 'validate' || sub === 'validar') {
                return reply('✅ *JSON Válido!* A estrutura está em conformidade com o padrão RFC 8259.')
            }

            await reply(`📋 *JSON ${isMinify ? 'MINIFICADO' : 'FORMATADO'}:*\n\`\`\`json\n${result}\n\`\`\``)
        } catch (err) {
            await reply(`❌ *Erro de Sintaxe JSON:*\n${err.message}`)
        }
    }
}

