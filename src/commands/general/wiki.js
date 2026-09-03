/**
 * Comando .wiki / .wikipedia
 * Consulta enciclopédica na Wikipédia em português
 */

const { searchWiki } = require("../../services/aiService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

module.exports = {
    name: "wiki",
    aliases: ["wikipedia", "enciclopedia", "artigo", "wikipédia"],
    category: "general",
    description: "Pesquisa verbetes e artigos oficiais na Wikipédia em português",
    cooldownMs: 3000,
    execute: async ({ text, args = [], reply, quotedText }) => {
        const query = (text || quotedText || args.join(" ")).trim()
        const botName = getBotName()

        if (!query) {
            return reply("📚 *ENCICLOPÉDIA WIKIPÉDIA*\n\nDigite o assunto que deseja consultar.\n\n📌 *Exemplo:* `.wiki Buraco Negro` ou `.wiki Santos Dumont`")
        }

        await reply(`📖 *Consultando Wikipédia:* _"${query.slice(0, 40)}"_... Aguarde.`)

        try {
            const res = await searchWiki(query)
            if (!res) {
                return reply(`❌ Não encontrei nenhum artigo na Wikipédia correspondente a _"${query}"_. Tente termos mais específicos.`)
            }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📚 *ENCICLOPÉDIA WIKIPÉDIA* 📚  ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📖 *${res.title}*\n\n`
            doc += `${res.extract.trim()}\n\n`
            doc += `🔗 *Artigo Completo:* ${res.url}\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        } catch (err) {
            logger.error("[WIKI COMMAND ERROR]", err)
            return reply("❌ *Erro ao consultar Wikipédia:* " + err.message)
        }
    }
}
