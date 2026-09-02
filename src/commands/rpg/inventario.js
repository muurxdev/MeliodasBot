const invCommand = require('./inv');

module.exports = {
    name: 'inventario',
    aliases: ['itens', 'inventory', 'meuinventario'],
    category: 'rpg',
    description: 'Exibe os itens e equipamentos no seu inventário',
    execute: async (context) => {
        return invCommand.execute(context);
    }
};

