/**
 * Comando .livroaleatorio
 * Sorteia um livro/apostila com foco em DESENVOLVIMENTO (o grupo é de devs) e
 * delega ao comando .livro para buscar e baixar o arquivo real.
 */

const logger = require('../../core/logger')

// Temas/títulos de programação e computação (domínio público ou amplamente
// disponíveis em acervos legais). O .livro busca em archive.org/OpenLibrary.
// Temas em PORTUGUÊS por padrão — o grupo é BR, então o sorteio busca obras em
// pt-BR. (Para outro idioma, use `.livroaleatorio <tema> --en`, por exemplo.)
const DEV_TOPICS = [
    'lógica de programação', 'algoritmos e estruturas de dados', 'introdução à programação',
    'programação orientada a objetos', 'engenharia de software', 'banco de dados',
    'redes de computadores', 'sistemas operacionais', 'desenvolvimento web',
    'programação python', 'programação java', 'javascript programação',
    'linguagem C programação', 'git controle de versão', 'linux administração',
    'inteligência artificial', 'aprendizado de máquina', 'segurança da informação',
    'arquitetura de software', 'padrões de projeto software', 'código limpo',
    'análise de sistemas', 'computação teoria', 'matemática discreta',
    'estrutura de dados em C', 'programação para iniciantes', 'testes de software',
    'metodologias ágeis scrum', 'cloud computing', 'ciência de dados'
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
