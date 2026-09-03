const logger = require('../../core/logger');

const NEWS = [
    {
        category: 'Tecnologia',
        emoji: '💻',
        title: 'Brasil lança programa nacional de inteligência artificial',
        summary: 'O governo federal anunciou investimento de R$ 5 bilhões em pesquisa e desenvolvimento de IA, com foco em saúde, educação e segurança pública.',
        source: 'Folha Tech',
        date: '03/09/2026'
    },
    {
        category: 'Economia',
        emoji: '📈',
        title: 'Selic atinge menor nível em 8 anos e impulsiona crédito',
        summary: 'A taxa básica de juros caiu para 8,5% ao ano, estimulando consumo e investimentos no mercado imobiliário e de veículos.',
        source: 'Valor Econômico',
        date: '02/09/2026'
    },
    {
        category: 'Esportes',
        emoji: '⚽',
        title: 'Brasil se classifica para a final da Copa América Sub-20',
        summary: 'A seleção brasileira venceu a Argentina por 2 a 0 e garantiu vaga na final do torneio, que será disputada no Maracanã.',
        source: 'Ge Globo',
        date: '02/09/2026'
    },
    {
        category: 'Ciência',
        emoji: '🔬',
        title: 'Pesquisadores brasileiros descobrem nova espécie na Amazônia',
        summary: 'Uma equipe da USP identificou um anfíbio desconhecido na Serra do Divisor, em Acre, com características únicas de adaptação ao clima tropical.',
        source: 'Revista Science',
        date: '01/09/2026'
    },
    {
        category: 'Cultura',
        emoji: '🎬',
        title: 'Filme brasileiro vence Festival de Veneza',
        summary: 'O longa "Raízes", dirigido por Kleber Mendonça Filho, conquistou o Leão de Ouro, o maior prêmio do cinema europeu, marcando a segunda vez que um filme brasileiro vence o festival.',
        source: 'CinePop',
        date: '01/09/2026'
    }
];

module.exports = {
    name: 'noticias',
    aliases: ['news', 'noticia', 'noticiasdehoje'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Exibe as últimas notícias fictícias de categorias variadas',
    cooldownMs: 30000,
    execute: async ({ reply }) => {
        let doc = [
            `╔══════════════════════════════╗`,
            `║   📰 *ÚLTIMAS NOTÍCIAS* 📰   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `🗞️ *Notícias de hoje:*\n`
        ].join('\n');

        for (const news of NEWS) {
            doc += `${news.emoji} *[${news.category}]* ${news.title}\n`;
            doc += `📝 ${news.summary}\n`;
            doc += `📰 _${news.source}_ — ${news.date}\n\n`;
        }

        doc += `💡 _Notícias fictícias para demonstração._`;
        return reply(doc);
    }
};
