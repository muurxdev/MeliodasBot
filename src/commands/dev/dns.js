/**
 * MeliodasBot — Comando .dns
 * Consulta registros DNS com segurança (A, AAAA, MX, TXT, NS, CNAME)
 */

const { resolveDnsRecords } = require('../../services/devService')

module.exports = {
    name: 'dns',
    aliases: ['nslookup', 'dig', 'dnsquery'],
    category: 'dev',
    description: 'Consulta registros DNS de um domínio (A, AAAA, MX, TXT, NS, CNAME)',
    cooldownMs: 3000,
    execute: async ({ text, reply }) => {
        if (!text) {
            return reply('❌ Informe o domínio e opcionalmente o tipo de registro.\n\n📌 *Exemplos:*\n• `.dns google.com`\n• `.dns github.com MX`\n• `.dns cloudflare.com TXT`')
        }

        const parts = text.trim().split(/\s+/)
        const domain = parts[0]
        const type = parts[1] || 'A'

        try {
            const res = await resolveDnsRecords(domain, type)

            let msg = `🌐 *CONSULTA DNS (${res.type})*\n📌 *Domínio:* \`${res.domain}\`\n\n`

            if (res.records.length === 0) {
                msg += `_Nenhum registro do tipo ${res.type} encontrado._`
            } else {
                msg += `*Registros Retornados:*\n`
                res.records.forEach((rec, idx) => {
                    if (typeof rec === 'object') {
                        msg += `${idx + 1}. \`${JSON.stringify(rec)}\`\n`
                    } else {
                        msg += `${idx + 1}. \`${rec}\`\n`
                    }
                })
            }

            await reply(msg.trim())
        } catch (err) {
            await reply(`❌ *Erro na consulta DNS:* ${err.message}`)
        }
    }
}

