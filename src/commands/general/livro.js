/**
 * Comando .livro / .pdf / .ebook / .book / .libro / .livre
 * Motor inteligente multilíngue com contagem real de páginas e sugestões dinâmicas de autor
 */

const { 
    detectBookLanguage, 
    getI18nLabels, 
    countPdfPages, 
    formatPageBreakdown, 
    searchBooks, 
    resolvePdfUrl, 
    downloadPdfBuffer 
} = require('../../services/bookService');
const { unlockPdfBuffer } = require('../../utils/pdfSecurity');
const { getBotName } = require('../../config/botConfig');
const { renderCard } = require('../../utils/uiEngine');
const logger = require('../../core/logger');

module.exports = {
    name: 'livro',
    aliases: ['pdf', 'ebook', 'book', 'libro', 'livre', 'livros', 'ler', 'arquivo', 'documento', 'baixarpdf', 'doc'],
    category: 'general',
    description: 'Busca inteligente multilíngue de livros e envio de PDFs com autor, ano, edição e sinopse',
    cooldownMs: 3000,
    execute: async ({ text, args, from, client, reply, prefix = '.', info, sender }) => {
        const botName = getBotName();
        const cleanSender = sender ? sender.split('@')[0].split(':')[0] : 'Usuário';

        if (!text || !text.trim()) {
            const card = renderCard({
                title: "BIBLIOTECA DIGITAL & ACERVO DE LIVROS",
                icon: "📚",
                subtitle: `📖 *Solicitante:* @${cleanSender}`,
                sections: [
                    {
                        title: "COMO PESQUISAR OBRAS & IDIOMAS",
                        icon: "🔍",
                        fields: [
                            `\`${prefix}livro <título>\` ➔ Baixar em Português`,
                            `\`${prefix}livro <título> in english\` ou \`--en\` ➔ Baixar em Inglês`,
                            `\`${prefix}livro <título> en español\` ou \`--es\` ➔ Baixar em Espanhol`,
                            `\`${prefix}livro <título> en français\` ou \`--fr\` ➔ Baixar em Francês`,
                            `\`${prefix}livro lista <busca>\` ➔ Listar opções disponíveis`
                        ]
                    },
                    {
                        title: "EXEMPLOS MULTILÍNGUES",
                        icon: "💡",
                        fields: [
                            `• \`${prefix}livro O Homem de Giz\` _(Português)_`,
                            `• \`${prefix}livro Clean Code in english\` _(English)_`,
                            `• \`${prefix}livro El Principito en español\` _(Español)_`,
                            `• \`${prefix}livro Le Petit Prince en français\` _(Français)_`,
                            `• \`${prefix}livro Dom Casmurro Machado de Assis\``
                        ]
                    }
                ],
                tip: `Use ${prefix}pdf, ${prefix}book ou ${prefix}libro para atalhos!`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        const isSearchOnly = args[0]?.toLowerCase() === 'lista' || args[0]?.toLowerCase() === 'search' || args[0]?.toLowerCase() === 'list';
        const rawQuery = isSearchOnly ? args.slice(1).join(' ').trim() : text.trim();

        if (!rawQuery) {
            return reply(`❌ Por favor, informe o nome do livro ou autor que deseja buscar (ex: \`${prefix}livro O Homem de Giz\` ou \`${prefix}book Clean Code in english\`).`);
        }

        // Detecção do idioma solicitado
        const { lang, cleanQuery } = detectBookLanguage(rawQuery);
        const i18n = getI18nLabels(lang);

        try {
            const loadingMsg = i18n.loading.replace('{query}', cleanQuery);
            await reply(loadingMsg);

            const results = await searchBooks(cleanQuery, 6, lang);

            if (!results || results.length === 0) {
                const notFoundMsg = i18n.notFound.replace('{query}', cleanQuery);
                return reply(notFoundMsg);
            }

            // Modo 1: Apenas listagem de opções (.livro lista <nome>)
            if (isSearchOnly) {
                const fields = results.map((r, idx) => {
                    return `*${idx + 1}.* 📖 *${r.title}*\n   └ 👤 ${i18n.author}: *${r.author}* | 📅 ${i18n.year}: ${r.year}\n   └ 🏛️ ${i18n.edition}: ${r.edition || r.publisher}`;
                });

                const card = renderCard({
                    title: i18n.helpTitle,
                    icon: "📚",
                    subtitle: `🔍 *${cleanQuery}* (${results.length} results)`,
                    sections: [
                        {
                            title: i18n.howToSearch,
                            icon: "📖",
                            fields
                        }
                    ],
                    tip: i18n.tipAuthor.replace(/{author}/g, results[0]?.author || 'autor'),
                    mentions: [sender]
                });

                return reply(card, [sender]);
            }

            // Modo 2: Download e envio direto do PDF Real com Ficha Técnica Completa no Idioma Solicitado
            // Tenta cada resultado até encontrar um PDF disponível
            let targetBook = null;
            let pdfInfo = null;
            let pdfResult = null;

            for (const book of results) {
                logger.info(`[LIVRO] Tentando baixar: "${book.title}" (${book.identifier}) de ${book.source}`);
                const info = await resolvePdfUrl(book.identifier, book.title, lang);
                if (!info?.downloadUrl) {
                    logger.warn(`[LIVRO] Sem URL de download para: "${book.title}" (${book.identifier})`);
                    continue;
                }
                const result = await downloadPdfBuffer(info.downloadUrl, book);
                if (result) {
                    logger.info(`[LIVRO] PDF baixado com sucesso: "${book.title}" (${result.sizeMb})`);
                    targetBook = book;
                    pdfInfo = info;
                    pdfResult = result;
                    break;
                } else {
                    logger.warn(`[LIVRO] Download falhou para: "${book.title}" — URL: ${info.downloadUrl.substring(0, 80)}`);
                }
            }

            if (!targetBook || !pdfResult) {
                // Nenhum PDF encontrado — mostra sugestões dos resultados encontrados
                const suggestions = results.slice(0, 5).map((r, idx) =>
                    `*${idx + 1}.* 📖 *${r.title}*\n   └ 👤 ${r.author} | 🏛️ ${r.source}`
                ).join('\n\n');

                const notFoundMsg = {
                    pt: `❌ *Nenhum PDF disponível para download para:* _"${cleanQuery}"_\n\n📚 *Outros livros encontrados no acervo:*\n\n${suggestions}\n\n💡 *Dica:* Use \`${prefix}livro <título>\` para tentar baixar algum desses livros listados acima.`,
                    en: `❌ *No PDF available for download for:* _"${cleanQuery}"_\n\n📚 *Other books found in the archive:*\n\n${suggestions}\n\n💡 *Tip:* Use \`${prefix}book <title>\` to try downloading any of the books listed above.`,
                    es: `❌ *Ningún PDF disponible para descargar para:* _"${cleanQuery}"_\n\n📚 *Otros libros encontrados en el acervo:*\n\n${suggestions}\n\n💡 *Consejo:* Use \`${prefix}libro <título>\` para intentar descargar alguno de los libros listados arriba.`
                };
                return reply(notFoundMsg[lang] || notFoundMsg.pt);
            }

            const { buffer: rawBuffer, sizeMb } = pdfResult;

            // Verificação e remoção de senhas / restrições de criptografia
            const secResult = unlockPdfBuffer(rawBuffer);
            const finalBuffer = secResult.buffer;

            // Contagem e discriminação exata de páginas do arquivo PDF real
            const detectedPdfPages = countPdfPages(finalBuffer);
            const formattedPages = formatPageBreakdown(detectedPdfPages, targetBook.pagesCount, lang);

            const fileName = (targetBook.title.replace(/[/\\?%*:|"<>]/g, '').trim() || 'Book') + '.pdf';
            const dynamicAuthorTip = i18n.tipAuthor.replace(/{author}/g, targetBook.author);

            const sourceUrl = pdfInfo?.detailsUrl || targetBook.sourceUrl || (targetBook.identifier ? `https://archive.org/details/${targetBook.identifier}` : 'https://archive.org');
            const securityStatus = secResult.isEncrypted && !secResult.isUnlocked ? `🔐 ${secResult.password}` : `${i18n.unlocked}`;

            // Ficha técnica completa diretamente no idioma solicitado
            let caption = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            caption += `┃   📖 *${i18n.headerTitle}* 📖\n`;
            caption += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            caption += `📚 *${targetBook.title}*\n\n`;
            caption += `╭━━━〔 📋 ${i18n.headerTitle} 〕━━━┈⊷\n`;
            caption += `┃ 📚 *${i18n.officialTitle}:* ${targetBook.title}\n`;
            caption += `┃ 👤 *${i18n.author}:* ${targetBook.author}\n`;
            caption += `┃ 📅 *${i18n.year}:* ${targetBook.year}\n`;
            caption += `┃ 🏛️ *${i18n.edition}:* ${targetBook.edition || targetBook.publisher}\n`;
            caption += `┃ 📄 *${i18n.pages}:* ${formattedPages}\n`;
            caption += `┃ 🎭 *${i18n.genre}:* ${targetBook.genre || 'Literature'}\n`;
            caption += `┃ 📦 *${i18n.fileSize}:* ${sizeMb}\n`;
            caption += `┃ 🌐 *${i18n.language}:* ${targetBook.language || i18n.langName}\n`;
            caption += `┃ 🏛️ *${i18n.source}:* ${targetBook.source}\n`;
            caption += `┃ 🔗 *${i18n.sourceLink}:* ${sourceUrl}\n`;
            caption += `┃ 🔐 *${i18n.securityLabel}:* ${securityStatus}\n`;
            caption += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

            if (targetBook.description) {
                caption += `╭━━━〔 📝 ${i18n.synopsisTitle} 〕━━━┈⊷\n`;
                caption += `┃ ${targetBook.description}\n`;
                caption += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            }

            caption += `💡 *Dica:* ${dynamicAuthorTip}\n`;
            caption += `👑 *${botName}*`;

            if (process.env.NODE_ENV === 'test') {
                return reply(caption);
            }

            await client.sendMessage(from, {
                document: finalBuffer,
                mimetype: 'application/pdf',
                fileName,
                caption
            }, { quoted: info });

        } catch (err) {
            logger.error('[LIVRO ERROR]', err);
            return reply(`❌ Error: ${err.message}`);
        }
    }
};
