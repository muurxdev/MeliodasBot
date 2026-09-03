/**
 * Comando .livroaleatorio
 * Sorteia um livro/apostila com foco em DESENVOLVIMENTO (o grupo é de devs) e
 * delega ao comando .livro para buscar e baixar o arquivo real.
 */

const logger = require('../../core/logger')

// Temas/títulos de programação e computação (domínio público ou amplamente
// disponíveis em acervos legais). O .livro busca em archive.org/OpenLibrary.
const DEV_TOPICS = [
    'clean code', 'the pragmatic programmer', 'design patterns', 'refactoring',
    'introduction to algorithms', 'structure and interpretation of computer programs',
    'the art of computer programming', 'code complete', 'javascript the good parts',
    'eloquent javascript', 'you dont know js', 'python crash course',
    'automate the boring stuff with python', 'fluent python', 'effective java',
    'the c programming language', 'the rust programming language', 'go programming language',
    'operating systems three easy pieces', 'computer networking', 'database system concepts',
    'linux command line', 'pro git', 'the linux programming interface',
    'cracking the coding interview', 'domain driven design', 'working effectively with legacy code',
    'test driven development', 'the mythical man month', 'algoritmos lógica de programação',
    'estruturas de dados', 'engenharia de software'
]

module.exports = {
    name: 'livroaleatorio',
    aliases: ['randombook', 'livrorandom', 'sorteiolivro', 'apostilaaleatoria'],
    category: 'general',
    subcategory: 'Livros & Materiais',
    description: 'Sorteia e baixa um livro/apostila de programação (foco dev)',
    cooldownMs: 5000,
    execute: async (ctx) => {
        const { reply, args } = ctx
        // Permite focar num sub-tema: .livroaleatorio python
        const filtro = (args && args.join(' ').toLowerCase().trim()) || ''
        let pool = DEV_TOPICS
        if (filtro) {
            const f = pool.filter(t => t.includes(filtro))
            if (f.length) pool = f
        }
        const escolhido = pool[Math.floor(Math.random() * pool.length)]

        await reply(`🎲 *Livro dev sorteado:* _${escolhido}_\n📚 Buscando e preparando o download...`)
        logger.info(`[LIVRO ALEATORIO] Sorteado: ${escolhido}`)

        try {
            // Delega ao comando .livro com o título sorteado
            const livro = require('./livro')
            return await livro.execute({ ...ctx, text: escolhido, args: escolhido.split(' '), commandName: 'livro' })
        } catch (e) {
            logger.error('[LIVRO ALEATORIO ERROR]', e)
            return reply(`❌ Não consegui buscar o livro sorteado. Tente \`.livro ${escolhido}\` diretamente.`)
        }
    }
}
