/**
 * Atividades de progressão do RPG (treinar, meditar, patrulhar, vigília, expedição).
 *
 * Todas seguem o mesmo contrato: cooldown próprio por atividade + recompensa
 * proporcional ao XP QUE FALTA PARA O PRÓXIMO NÍVEL. Isso é importante: com
 * recompensa fixa, as atividades viram inúteis no endgame (a curva é
 * 100 * nivel^1.5). Usando uma FRAÇÃO do custo do nível, elas seguem relevantes
 * do nível 1 ao 500 sem inflacionar a economia.
 */

const { calcularXpNecessario } = require('./xpService')

/**
 * @param {object} user
 * @param {string} chave     identificador da atividade (guarda o timestamp em user)
 * @param {number} cooldownMs
 * @returns {{pronto: boolean, restanteMs: number}}
 */
function checarCooldown(user, chave, cooldownMs) {
    const campo = `ultima_${chave}`
    const ultima = Number(user[campo] || 0)
    const decorrido = Date.now() - ultima
    if (ultima && decorrido < cooldownMs) {
        return { pronto: false, restanteMs: cooldownMs - decorrido }
    }
    return { pronto: true, restanteMs: 0 }
}

function marcarUso(user, chave) {
    user[`ultima_${chave}`] = Date.now()
}

/** "1h 23min" / "45min" / "30s" */
function formatarEspera(ms) {
    const s = Math.ceil(ms / 1000)
    if (s < 60) return `${s}s`
    const min = Math.floor(s / 60)
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    return `${h}h ${min % 60}min`
}

/**
 * XP da atividade: fração do custo do próximo nível, com variação de ±15%.
 * @param {number} level
 * @param {number} fracao  ex.: 0.04 = 4% do nível
 */
function calcularXpAtividade(level, fracao) {
    const alvo = calcularXpNecessario(Math.max(1, level || 1)) * fracao
    const variacao = 0.85 + Math.random() * 0.3
    return Math.max(10, Math.floor(alvo * variacao))
}

/** Coins proporcionais ao nível (bem mais contidos que o XP). */
function calcularCoinsAtividade(level, base) {
    return Math.floor((base + (level || 1) * base * 0.35) * (0.85 + Math.random() * 0.3))
}

module.exports = { checarCooldown, marcarUso, formatarEspera, calcularXpAtividade, calcularCoinsAtividade }
