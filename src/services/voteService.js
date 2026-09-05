/**
 * Votação democrática de moderação (.votekick / .voteban).
 *
 * Fluxo: anuncia a votação, coleta "SIM"/"NAO" das mensagens comuns do grupo
 * (via interactionService, que já é consultado para toda mensagem sem prefixo),
 * e ao fim do prazo apura e executa a ação se aprovada.
 *
 * Regras: 1 voto por pessoa (o último vale), o alvo não vota, exige um mínimo de
 * votos para valer, e maioria simples entre SIM e NAO.
 */

const interactionService = require('./interactionService')
const logger = require('../core/logger')

// Uma votação por grupo de cada vez.
const emAndamento = new Map()

function _contar(votos) {
    let sim = 0, nao = 0
    for (const v of votos.values()) { if (v === 'sim') sim++; else if (v === 'nao') nao++ }
    return { sim, nao, total: sim + nao }
}

/**
 * @param {object} o
 * @param {string} o.acao 'kick' (remover do grupo) | 'ban' (remover + banir do bot)
 * @returns {Promise<void>}
 */
async function iniciarVotacao({ client, from, reply, alvo, acao = 'kick', iniciador, isBotAdmin, duracaoMs = 60000, minVotos = 3 }) {
    if (emAndamento.has(from)) {
        return reply('⚠️ *Já existe uma votação em andamento neste grupo.* Aguarde ela terminar.')
    }
    if (interactionService.has(from)) {
        return reply('⚠️ Há outra interação ativa no grupo (jogo/fluxo). Aguarde terminar para abrir a votação.')
    }

    const rotulo = acao === 'ban' ? 'BANIR' : 'EXPULSAR'
    const alvoNum = alvo.split('@')[0]
    const votos = new Map()
    emAndamento.set(from, true)

    await client.sendMessage(from, {
        text: `╔══════════════════════════════╗\n` +
            `║   🗳️ *VOTAÇÃO: ${rotulo}* 🗳️   ║\n` +
            `╚══════════════════════════════╝\n\n` +
            `👤 *Alvo:* @${alvoNum}\n` +
            `🙋 *Aberta por:* @${iniciador.split('@')[0]}\n` +
            `⏱️ *Prazo:* ${Math.round(duracaoMs / 1000)} segundos\n\n` +
            `╭━〔 COMO VOTAR 〕━⬣\n` +
            `┃ ✅ Digite *SIM* para aprovar\n` +
            `┃ ❌ Digite *NAO* para rejeitar\n` +
            `╰━━━━━━━━━━━━━━━━━━⬣\n\n` +
            `📊 _Mínimo de ${minVotos} votos. Vence a maioria simples._`,
        mentions: [alvo, iniciador]
    })

    interactionService.register(from, {
        type: 'votacao',
        ttlMs: duracaoMs + 10000,
        onText: async (texto, ctx) => {
            const t = String(texto || '').trim().toLowerCase()
            const votante = ctx && ctx.userJid
            if (!votante || votante === alvo) return false
            let v = null
            if (/^(sim|s|yes|y|👍)$/.test(t)) v = 'sim'
            else if (/^(nao|não|n|no|👎)$/.test(t)) v = 'nao'
            if (!v) return false
            votos.set(votante, v)
            // false = não consome a mensagem; ela segue o fluxo normal do grupo.
            return false
        }
    })

    setTimeout(async () => {
        try {
            interactionService.clear(from)
            emAndamento.delete(from)

            const { sim, nao, total } = _contar(votos)

            if (total < minVotos) {
                return client.sendMessage(from, {
                    text: `🗳️ *VOTAÇÃO ENCERRADA — SEM QUÓRUM*\n\n👤 *Alvo:* @${alvoNum}\n📊 *Votos:* ${sim} SIM · ${nao} NAO (mín. ${minVotos})\n✅ Nada foi feito.`,
                    mentions: [alvo]
                })
            }

            if (sim <= nao) {
                return client.sendMessage(from, {
                    text: `🗳️ *VOTAÇÃO ENCERRADA — REJEITADA*\n\n👤 *Alvo:* @${alvoNum}\n📊 *Votos:* ${sim} SIM · ${nao} NAO\n🛡️ O grupo decidiu manter o participante.`,
                    mentions: [alvo]
                })
            }

            // Aprovada
            if (!isBotAdmin) {
                return client.sendMessage(from, {
                    text: `🗳️ *VOTAÇÃO APROVADA* (${sim} x ${nao})\n\n⚠️ Mas eu *não sou administrador* deste grupo e não consigo executar a ação.`,
                    mentions: [alvo]
                })
            }

            await client.groupParticipantsUpdate(from, [alvo], 'remove').catch(e => {
                logger.warn(`[VOTACAO] Falha ao remover ${alvo}: ${e.message}`)
            })

            let extra = ''
            if (acao === 'ban') {
                try {
                    const { banUser } = require('./securityService')
                    banUser(alvo, `Votação do grupo aprovou o banimento (${sim} x ${nao})`, 'votacao-do-grupo')
                    extra = '\n🚫 *Também foi banido de usar o bot.*'
                } catch (e) {
                    logger.warn(`[VOTACAO] Falha ao banir ${alvo}: ${e.message}`)
                }
            }

            logger.info(`[VOTACAO] ${acao} aprovado em ${from} para ${alvo} (${sim}x${nao})`)
            return client.sendMessage(from, {
                text: `🗳️ *VOTAÇÃO APROVADA*\n\n👤 *Alvo:* @${alvoNum}\n📊 *Votos:* ${sim} SIM · ${nao} NAO\n⚖️ *Ação:* ${rotulo === 'BANIR' ? 'Removido e banido' : 'Removido do grupo'}.${extra}`,
                mentions: [alvo]
            })
        } catch (err) {
            logger.error('[VOTACAO ERROR]', err)
        }
    }, duracaoMs)
}

module.exports = { iniciarVotacao }
