const bossCommand = require('./boss')

module.exports = {
    name: 'atk',
    aliases: ['atacar', 'hit', 'bater'],
    category: 'rpg',
    description: 'Atalho rápido para atacar o Boss ativo (.boss atk)',
    execute: async (context) => {
        context.args = ['atk']
        return bossCommand.execute(context)
    }
}