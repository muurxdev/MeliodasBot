/**
 * Comando .setcookies / .cookies
 * Permite ao Dono enviar e atualizar o arquivo de cookies do YouTube/Instagram/TikTok diretamente pelo WhatsApp
 */

const fs = require("fs");
const path = require("path");
const { dataDir } = require("../../config/paths");
const { validateCookiesFile, getCookiesFilePath } = require("../../services/media/mediaArgs");
const { downloadWhatsAppMedia } = require("../../services/mediaService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "setcookies",
    aliases: ["addcookies", "upcookies", "youtubeauth"],
    category: "owner",
    description: "Configura ou atualiza o arquivo de cookies (Netscape) para download do YouTube, Instagram e TikTok",
    ownerOnly: true,
    execute: async ({ text, info, from, client, reply, sender }) => {
        const botName = getBotName();
        const cookiesPath = getCookiesFilePath();
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;
        const rawText = (text || "").trim();

        // 1. CASO CONSULTA: Sem argumentos e sem anexo
        if (!rawText && !quoted?.documentMessage && !info.message?.documentMessage) {
            const currentStatus = validateCookiesFile(cookiesPath);
            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🍪 *GESTÃO DE COOKIES* 🍪   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Status Atual:* " + (currentStatus.ok ? "🟢 *VÁLIDO & ATIVO*" : "🔴 *AUSENTE OU INVÁLIDO*") + "\n";
            if (currentStatus.ok) {
                doc += "┃ 📦 *Linhas de Cookies:* " + currentStatus.count + "\n";
                doc += "┃ 🌐 *Domínio Principal:* " + currentStatus.domain + "\n";
                doc += "┃ 📂 *Localização:* \`data/cookies.txt\`\n";
            } else {
                doc += "┃ ⚠️ *Motivo:* " + currentStatus.reason + " (" + (currentStatus.detail || "") + ")\n";
            }
            doc += "\n╭━〔 📖 COMO ATIVAR / ATUALIZAR 〕━⬣\n";
            doc += "┃ 1️⃣ No seu navegador Chrome/Brave/Edge no PC, instale a extensão gratuita:\n";
            doc += "┃    👉 *Get cookies.txt LOCALLY*\n";
            doc += "┃ 2️⃣ Abra o site do YouTube (ou Instagram/TikTok) logado em uma conta.\n";
            doc += "┃ 3️⃣ Clique na extensão e baixe o arquivo \`cookies.txt\`.\n";
            doc += "┃ 4️⃣ Envie o arquivo \`cookies.txt\` aqui no WhatsApp respondendo com:\n";
            doc += "┃    👉 \`.setcookies\`\n";
            doc += "┃    _Ou cole o texto do arquivo após o comando: \`.setcookies <conteúdo>\`_\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            doc += "👑 *" + botName + "*";

            return reply(doc.trim());
        }

        try {
            let cookieContent = "";

            // Se respondeu a um documento ou enviou documento com legenda
            const isDoc = !!(info.message?.documentMessage || quoted?.documentMessage);
            if (isDoc) {
                await reply("⏳ *Baixando e validando arquivo de cookies...* Aguarde.");
                const targetWrapper = info.message?.documentMessage ? info : {
                    key: {
                        remoteJid: from,
                        id: contextInfo?.stanzaId,
                        participant: contextInfo?.participant
                    },
                    message: quoted
                };
                const buffer = await downloadWhatsAppMedia(targetWrapper, "document", client);
                cookieContent = buffer.toString("utf8");
            } else if (rawText) {
                cookieContent = rawText;
            }

            if (!cookieContent || cookieContent.length < 20) {
                return reply("❌ *Conteúdo de cookies inválido ou vazio.* Envie o arquivo \`cookies.txt\` em formato Netscape.");
            }

            // Escreve temporariamente e valida
            const tempCookiePath = path.join(dataDir, "cookies.txt.tmp");
            fs.writeFileSync(tempCookiePath, cookieContent, "utf8");

            const validation = validateCookiesFile(tempCookiePath);
            if (!validation.ok) {
                try { fs.unlinkSync(tempCookiePath); } catch (_) {}
                return reply(`❌ *Arquivo de cookies rejeitado!*\n\n⚠️ *Motivo:* ${validation.reason}\n💡 *Detalhe:* ${validation.detail}\n\n_Certifique-se de exportar no formato Netscape oficial do YouTube._`);
            }

            // Move para o caminho definitivo
            fs.renameSync(tempCookiePath, cookiesPath);
            logger.info(`[COOKIES] ${sender} atualizou o arquivo de cookies com sucesso (${validation.count} linhas, domínio: ${validation.domain})`);

            let successDoc = "╔══════════════════════════════╗\n";
            successDoc += "║   ✅ *COOKIES ATUALIZADOS!* ✅   ║\n";
            successDoc += "╚══════════════════════════════╝\n\n";
            successDoc += "✨ *Autenticação do YouTube/Mídias ativada com sucesso!*\n\n";
            successDoc += "📊 *Detalhes da Conexão:*\n";
            successDoc += "┃ 🟢 *Status:* Operacional\n";
            successDoc += "┃ 📦 *Total de Cookies:* " + validation.count + " entradas\n";
            successDoc += "┃ 🌐 *Domínio Reconhecido:* " + validation.domain + "\n";
            successDoc += "┃ 🛡️ *Bypass Bot Check:* Ativo\n\n";
            successDoc += "💡 _Agora você pode usar \`.ytmp4\`, \`.video\` e \`.media\` sem restrições._\n\n";
            successDoc += "👑 *" + botName + "*";

            return reply(successDoc.trim());
        } catch (err) {
            logger.error("[SETCOOKIES ERROR]", err);
            return reply(`❌ *Erro ao processar cookies:* ${err.message}`);
        }
    }
};

