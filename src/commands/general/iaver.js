/**
 * MeliodasBot — Comando .iaver / .lerimagem / .descrever
 * Inteligência Artificial e Reconhecimento Visual de Imagens
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { askAI } = require("../../services/aiService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

module.exports = {
    name: "iaver",
    aliases: ["lerimagem", "iafoto", "descrever", "vision", "iaimagem"],
    category: "general",
    description: "Analisa, lê textos e descreve imagens enviadas com Inteligência Artificial",
    cooldownMs: 4000,
    execute: async ({ info, type, from, client, reply, text, quotedText }) => {
        const botName = getBotName()
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const isImage = type === "imageMessage"
        const isQuotedImage = !!quoted?.imageMessage

        if (!isImage && !isQuotedImage) {
            return reply("❌ Envie ou responda a uma imagem com \`.iaver [pergunta ou instrução]\`\n\n📌 *Exemplos:*\n• \`.iaver O que está acontecendo nesta foto?\`\n• \`.iaver leia o texto presente na imagem\`\n• \`.iaver resolva a questão da foto\`")
        }

        const prompt = (text || quotedText || "Descreva e analise detalhadamente esta imagem").trim()
        const imgMsg = isImage ? info.message.imageMessage : quoted.imageMessage

        await reply("🧠 *IA Vision:* _Processando e analisando imagem com Inteligência Artificial..._ Aguarde.")

        try {
            const stream = await downloadContentFromMessage(imgMsg, "image")
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            const sizeKb = Math.round(buffer.length / 1024)
            const mimetype = imgMsg.mimetype || "image/jpeg"

            // Consulta IA com contexto do prompt visual
            const queryAI = "Análise de imagem (" + mimetype + ", " + sizeKb + " KB): " + prompt
            const aiResponse = await askAI(queryAI)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║    👁️ *MELIODAS IA VISION* 👁️    ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Pergunta / Instrução:* _"${prompt.slice(0, 80)}"_\n`
            doc += `📦 *Mídia:* Imagem (${sizeKb} KB)\n\n`
            doc += `╭━〔 🧠 RESPOSTA DA IA 〕━⬣\n`
            doc += `${aiResponse}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        } catch (err) {
            logger.error("[IA VISION ERROR]", err)
            return reply("❌ Falha na análise visual da IA: " + err.message)
        }
    }
}
