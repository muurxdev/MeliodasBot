/**
 * Comando .recomendarlivro — Recomenda um livro aleatório de um gênero (ou geral)
 */
const REC_GENRE_MAP = {
    'fantasia': 'fantasy',
    'romance': 'romance',
    'terror': 'horror',
    'horror': 'horror',
    'ficcao': 'science_fiction',
    'historia': 'history',
    'filosofia': 'philosophy',
    'programacao': 'programming',
    'misterio': 'mystery',
    'poesia': 'poetry',
    'psicologia': 'psychology',
    'aventura': 'adventure'
};

module.exports = {
    name: "recomendarlivro",
    aliases: ["indicarlivro", "livrorecomendado"],
    category: "livros",
    subcategory: "Livros & Materiais",
    description: "Recomenda um livro aleatório de um gênero (ou geral)",
    cooldownMs: 4000,
    execute: async ({ text, reply, prefix = '.' }) => {
        const raw = String(text || '').trim().toLowerCase();
        const normalized = raw ? raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_') : '';
        const mapped = REC_GENRE_MAP[normalized] || normalized;
        const fallbackList = ['fantasy', 'romance', 'history', 'science_fiction', 'mystery', 'poetry', 'philosophy'];
        const g = mapped || fallbackList[Math.floor(Math.random() * fallbackList.length)];

        try {
            const ctl = new AbortController();
            const to = setTimeout(() => ctl.abort(), 12000);
            const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(g)}.json?limit=50`, {
                signal: ctl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            clearTimeout(to);

            const j = await r.json();
            const works = j.works || [];
            if (!works.length) return reply(`📗 Não encontrei recomendações para *${raw || g}*. Tente: fantasia, romance, historia, terror...`);

            const w = works[Math.floor(Math.random() * works.length)];
            const authors = (w.authors || []).map(a => a.name).slice(0, 2).join(', ') || 'Autor Desconhecido';

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📗 *INDICAÇÃO DE LEITURA* 📗  ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `🏷️ *Gênero:* ${j.name || g}\n`;
            doc += `📖 *Título:* ${w.title}\n`;
            doc += `✍️ *Autor:* ${authors}\n`;
            if (w.first_publish_year) doc += `📅 *Lançamento:* ${w.first_publish_year}\n`;
            doc += `\n💡 *Dica:* Para baixar o livro, digite: \`${prefix}livro ${w.title}\``;

            return reply(doc.trim());
        } catch (e) {
            return reply('❌ Serviço de recomendações indisponível agora. Tente novamente mais tarde.');
        }
    }
};
