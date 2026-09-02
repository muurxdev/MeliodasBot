const reencarnarCommand = require('./reencarnar');

module.exports = {
    name: 'rebirth',
    aliases: ['reborn', 'renascer'],
    category: 'rpg',
    description: 'Atalho para o sistema de Rebirth / Reencarnação (.reencarnar)',
    execute: async (context) => {
        return reencarnarCommand.execute(context);
    }
};

