/**
 * MeliodasBot — Comando .cotacao / .dolar / .euro / .btc
 * Cotações de Moedas e Criptoativos em Tempo Real com API Resiliente
 */

const { getCotacoes } = require('../../services/apiService');
const { renderCard } = require('../../utils/uiEngine');

module.exports = {
    name: 'cotacao',
    aliases: ['dolar', 'euro', 'btc', 'bitcoin', 'cripto', 'cambio', 'moedas', 'usd', 'eth'],
    category: 'general',
    description: 'Consulta cotações em tempo real de Dólar, Euro, Bitcoin e Ethereum',
    cooldownMs: 2000,
    execute: async ({ reply, sender, commandName }) => {
        const quotes = await getCotacoes();

        if (!quotes) {
            return reply('❌ Falha ao consultar cotações de mercado no momento. Tente novamente em instantes.');
        }

        const formatBRL = (val) => Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formatPct = (pct) => `${pct >= 0 ? '🟢 +' : '🔴 '}${pct.toFixed(2)}%`;

        const doc = renderCard({
            title: 'MERCADO FINANCEIRO & COTAÇÕES',
            icon: '📈',
            subtitle: `🕒 *Atualizado às:* ${quotes.atualizadoEm} (Horário de Brasília)`,
            sections: [
                {
                    title: 'MOEDAS TRADICIONAIS',
                    icon: '💵',
                    fields: [
                        { label: 'Dólar Comercial (USD)', value: `R$ ${formatBRL(quotes.usd.valor)} _(${formatPct(quotes.usd.variacao)})_`, icon: '🇺🇸' },
                        { label: 'Euro (EUR)', value: `R$ ${formatBRL(quotes.eur.valor)} _(${formatPct(quotes.eur.variacao)})_`, icon: '🇪🇺' }
                    ]
                },
                {
                    title: 'CRIPTOMOEDAS & ATIVOS DIGITAIS',
                    icon: '🪙',
                    fields: [
                        { label: 'Bitcoin (BTC)', value: `R$ ${formatBRL(quotes.btc.valor)} _(${formatPct(quotes.btc.variacao)})_`, icon: '₿' },
                        { label: 'Ethereum (ETH)', value: `R$ ${formatBRL(quotes.eth.valor)} _(${formatPct(quotes.eth.variacao)})_`, icon: 'Ξ' }
                    ]
                }
            ],
            tip: 'Dados obtidos via APIs oficiais de câmbio e mercados abertos.',
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};
