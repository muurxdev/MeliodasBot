/**
 * Comando .duelosorte — cara ou coroa valendo moedas.
 *
 * Era um stub: sorteava, escrevia "você ganhou X moedas" e não tocava no banco.
 * Dava para apostar 1,5 milhão com saldo zero e "ganhar" 3 milhões sem que nada
 * mudasse. Agora valida saldo e persiste via economyService.
 */

const economy = require('../../services/economyService')

module.exports = {
    name: 'duelosorte',
    aliases: ['caracoroaduelo', 'moedadourada'],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Aposta em cara ou coroa: .duelosorte <cara|coroa> <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const escolha = (args[0] || '').toLowerCase()

        if (!['cara', 'coroa'].includes(escolha)) {
            return reply(
                '🪙 *CARA OU COROA*\n\n' +
                '📌 *Uso:* `.duelosorte <cara|coroa> <valor>`\n\n' +
                '*Exemplos:*\n' +
                '`.duelosorte coroa 5000`\n' +
                '`.duelosorte cara tudo`\n' +
                '`.duelosorte coroa 50%`\n\n' +
                '💰 _Acertou, dobra a aposta. Errou, perde._'
            )
        }

        const sorteio = Math.random() < 0.5 ? 'cara' : 'coroa'
        const ganhou = escolha === sorteio

        const r = economy.resolverAposta({
            sender,
            texto: args[1],
            ganhou,
            multiplicador: 2
        })
        if (!r.ok) return reply(r.erro)

        return reply(economy.cartaoResultado({
            titulo: '   🪙 *MOEDA DOURADA* 🪙   ',
            linhas: [
                `🎯 *Você escolheu:* ${escolha.toUpperCase()}`,
                `🪙 *Caiu em:* ${sorteio.toUpperCase()}`,
                ganhou ? '🎉 *ACERTOU!*' : '💀 *ERROU!*'
            ],
            valor: r.valor,
            delta: r.delta,
            saldo: r.saldo,
            ganhou
        }))
    }
}
