/**
 * Comando .regex
 * Testador seguro de Expressões Regulares (RegExp)
 */

const { testRegex } = require('../../services/devService')

module.exports = {
    name: 'regex',
    aliases: ['regexp', 'regextest'],
    category: 'dev',
    description: 'Testa expressões regulares (Regex) contra uma string de teste',
    execute: async ({ text, args, reply }) => {
        if (!text) {
            return reply('❌ Informe a expressão regular e o texto para testar.\n\n📌 *Exemplo:* `.regex /^[a-z0-9]+$/i meliodas123`')
        }

        // Formato esperado: /pattern/flags texto de teste
        const regexMatch = text.match(/^\/(.+?)\/([gimsuy]*)\s+([\s\S]+)$/)

        let pattern = ''
        let flags = ''
        let testString = ''

        if (regexMatch) {
            pattern = regexMatch[1]
            flags = regexMatch[2]
            testString = regexMatch[3]
        } else {
            // Formato alternativo: .regex pattern texto
            pattern = args[0]
            testString = args.slice(1).join(' ')
        }

        if (!pattern || !testString) {
            return reply('❌ Formato inválido.\n\n📌 *Sintaxe:* `.regex /padrao/flags texto de teste`\n*Exemplo:* `.regex /[0-9]{3}/g Meu código é 123 e 456`')
        }

        try {
            const res = testRegex(pattern, flags, testString)

            let resultMsg = `🔬 *TESTE DE REGEX*\n\n🎯 *Padrão:* \`/${pattern}/${flags}\`\n📝 *Entrada:* \`${testString}\`\n`

            if (res.matched) {
                resultMsg += `\n✅ *Status:* *MATCH ENCONTRADO!*`
                resultMsg += `\n📌 *Primeiro Match:* \`${res.firstMatch}\``
                if (res.allMatches && res.allMatches.length > 1) {
                    resultMsg += `\n🔢 *Todos os Matches (${res.allMatches.length}):* \`${res.allMatches.join(', ')}\``
                }
                if (res.groups) {
                    resultMsg += `\n📦 *Grupos Capturados:*\n\`\`\`json\n${JSON.stringify(res.groups, null, 2)}\n\`\`\``
                }
            } else {
                resultMsg += `\n❌ *Status:* *NENHUM MATCH ENCONTRADO*`
            }

            await reply(resultMsg)
        } catch (err) {
            await reply(`❌ *Erro na Expressão Regular:* ${err.message}`)
        }
    }
}

