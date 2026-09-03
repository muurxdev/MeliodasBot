/**
 * Comando .resumolivro / .sinopse / .resumo
 * Consulta inteligente de sinopses e resumos estruturados de obras literárias
 */

const { searchBooks } = require('../../services/bookService');
const { renderCard } = require('../../utils/uiEngine');

module.exports = {
    name: 'resumolivro',
    aliases: ['sinopse', 'resumo', 'sinopselivro', 'resumir'],
    category: 'general',
    description: 'Exibe o resumo completo, sinopse e detalhes técnicos de qualquer livro',
    cooldownMs: 2000,
    execute: async ({ text, reply, prefix = '.', sender }) => {
        const query = (text || '').trim();
        if (!query) {
            return reply(`❌ Informe o nome do livro ou autor para ver o resumo (ex: \`${prefix}resumo O Pequeno Príncipe\` ou \`${prefix}resumo Clean Code\`).`);
        }

        await reply(`⏳ 🔍 *Pesquisando sinopse e resumo de:* _"${query}"_...`);

        try {
            const results = await searchBooks(query, 3);
            if (!results || results.length === 0) {
                return reply(`❌ Nenhuma sinopse encontrada para o termo: _"${query}"_.`);
            }

            const book = results[0];
            const card = renderCard({
                title: "RESUMO & SINOPSE DA OBRA",
                icon: "📖",
                subtitle: `📚 *${book.title}*`,
                sections: [
                    {
                        title: "FICHA TÉCNICA",
                        icon: "📋",
                        fields: [
                            { label: "Autor(es)", value: book.author, icon: "👤" },
                            { label: "Ano de Publicação", value: book.year, icon: "📅" },
                            { label: "Edição / Editora", value: book.edition || book.publisher, icon: "🏛️" },
                            { label: "Páginas", value: book.pages || 'N/A', icon: "📄" }
                        ]
                    },
                    {
                        title: "SINOPSE DA HISTÓRIA",
                        icon: "📝",
                        fields: [
                            book.description || 'Resumo e sinopse disponíveis nos acervos literários internacionais.'
                        ]
                    }
                ],
                tip: `Para baixar o PDF completo, digite: ${prefix}livro ${book.title}`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        } catch (e) {
            return reply(`❌ Erro ao buscar resumo: ${e.message}`);
        }
    }
};

