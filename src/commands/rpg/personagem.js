const bonecoCommand = require('./boneco');

module.exports = {
    name: 'personagem',
    aliases: ['avatar', 'meuheroi', 'statusrpg', 'meuboneco'],
    category: 'rpg',
    description: 'Exibe sua ficha de personagem e boneco visual de RPG',
    execute: async (context) => {
        return bonecoCommand.execute(context);
    }
};

