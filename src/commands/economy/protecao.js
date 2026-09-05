/**
 * Comando .protecao — compra escudo anti-roubo por 24h.
 *
 * Sem argumento mostra o status (e quanto falta). Com `comprar`, compra.
 * Pedir confirmação explícita evita que alguém gaste 1.000 sem querer só por
 * ter digitado o comando para consultar.
 */

const economy = require('../../services/economyService')
const protecao = require('../../services/protectionService')

module.exports = {
    name: 'protecao',
    aliases: ['escudo', 'antirroubo', 'antiroubo', 'protecaoroubo'],
    category: 'economy',
    subcategory: 'Proteção',
    description: 'Compra proteção anti-roubo por 24h',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const user = economy.carregarUsuario(sender)
        const ativo = protecao.estaProtegido(user)
        const acao = (args[0] || '').toLowerCase()

        const horas = Math.round(protecao.DURACAO_MS / 3600000)

        if (!['comprar', 'buy', 'ativar', 'renovar'].includes(acao)) {
            let doc = '🛡️ *PROTEÇÃO ANTI-ROUBO*\n\n'

            if (ativo) {
                doc += '✅ *Status:* ATIVA\n'
                doc += `⏳ *Expira em:* ${protecao.formatarRestante(protecao.restanteMs(user))}\n\n`
                doc += '_Ninguém consegue te roubar enquanto durar._\n\n'
                doc += `💡 Use \`.protecao renovar\` para somar mais ${horas}h.`
            } else {
                doc += '❌ *Status:* DESPROTEGIDO\n\n'
                doc += `💰 *Preço:* ${economy.formatar(protecao.PRECO)} moedas\n`
                doc += `⏳ *Duração:* ${horas} horas\n\n`
                doc += '🔒 _Bloqueia todas as tentativas de_ `.roubar` _contra você._\n\n'
                doc += '👉 Use `.protecao comprar` para ativar.'
            }

            doc += `\n\n💰 _Seu saldo:_ ${economy.formatar(economy.saldo(user))} moedas`
            return reply(doc)
        }

        const r = protecao.comprar(sender)
        if (!r.ok) return reply(r.erro)

        return reply(
            '🛡️ *PROTEÇÃO ATIVADA*\n\n' +
            `💸 *Pago:* ${economy.formatar(protecao.PRECO)} moedas\n` +
            `⏳ *Protegido por:* ${r.restante}\n` +
            `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n` +
            '🔒 _Tentativas de roubo contra você serão bloqueadas._'
        )
    }
}
