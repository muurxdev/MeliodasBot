module.exports = {
    name: 'docs',
    aliases: ['documentacao'],
    category: 'dev',
    description: 'Documentações úteis de programação',
    execute: async ({ text, reply }) => {
        const lang = text ? text.toLowerCase().trim() : ''
        if (lang === 'js' || lang === 'javascript') {
            return reply('📘 https://developer.mozilla.org/pt-BR/docs/Web/JavaScript')
        }
        if (lang === 'node' || lang === 'nodejs') {
            return reply('🟢 https://nodejs.org/docs/latest/api/')
        }
        if (lang === 'react') {
            return reply('⚛️ https://react.dev/')
        }
        if (lang === 'python') {
            return reply('🐍 https://docs.python.org/3/')
        }
        return reply('❌ Digite: .docs js, .docs node, .docs react ou .docs python')
    }
}