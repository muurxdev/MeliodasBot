/**
 * Núcleo da economia: saldo, apostas e transferências.
 *
 * O PROBLEMA QUE ISSO RESOLVE
 * ---------------------------
 * Dezenas de comandos de cassino foram escritos como texto puro: sorteavam um
 * resultado, escreviam "você ganhou 3.000.000 moedas" e NÃO tocavam no banco.
 * O usuário apostava 1,5 milhão sem ter um centavo, "ganhava" e o saldo ficava
 * igual. Pior que não funcionar: mente para quem está jogando.
 *
 * A causa é sempre a mesma — cada comando reimplementava (ou esquecia) a
 * validação de saldo e a persistência. Aqui isso vira UM lugar só, e um comando
 * de aposta passa a ser: sortear + chamar `resolverAposta`.
 *
 * `coins` é gravada com estratégia 'direct' no userRepository, então
 * `saveUser` normal já persiste aumento E redução — não precisa de
 * `{ force: true }` (esse é para level/xp/mochila).
 */

const dataService = require('./dataService')
const logger = require('../core/logger')

// Piso e teto padrão de uma aposta. O teto evita que um número absurdo
// (ou um overflow) vire saldo negativo impossível de auditar.
const APOSTA_MINIMA = Number(process.env.ECONOMY_APOSTA_MINIMA || 10)
const APOSTA_MAXIMA = Number(process.env.ECONOMY_APOSTA_MAXIMA || 10_000_000)

/** Formata para o padrão brasileiro: 1500000 -> "1.500.000". */
function formatar(n) {
    return Number(n || 0).toLocaleString('pt-BR')
}

/** Carrega o usuário já com os defaults do domínio aplicados. */
function carregarUsuario(sender) {
    // initializeUser(sender) consulta o banco pontualmente — ao contrário de
    // getXpData(), que carrega a tabela inteira só para ler uma linha.
    return dataService.initializeUser(sender)
}

function saldo(user) {
    return Number(user?.coins || 0)
}

/**
 * Interpreta o valor digitado pelo usuário.
 *
 * Aceita "500", "1k", "2.5m", "tudo", "metade", "50%". O código antigo fazia
 * `parseInt(args[1]) || 50`, que transformava um erro de digitação numa aposta
 * silenciosa de 50 moedas — o usuário nem percebia.
 *
 * @returns {number|null} null quando não dá para interpretar
 */
function parseValor(texto, saldoAtual = 0) {
    if (texto === null || texto === undefined) return null
    const t = String(texto).trim().toLowerCase().replace(/\s/g, '')
    if (!t) return null

    if (['tudo', 'all', 'allin', 'max', 'máximo', 'maximo'].includes(t)) {
        return Math.floor(saldoAtual)
    }
    if (['metade', 'half'].includes(t)) return Math.floor(saldoAtual / 2)

    const pct = t.match(/^(\d+(?:[.,]\d+)?)%$/)
    if (pct) {
        const p = Number(pct[1].replace(',', '.'))
        if (!Number.isFinite(p) || p <= 0 || p > 100) return null
        return Math.floor(saldoAtual * (p / 100))
    }

    // "1k" = mil, "2.5m" = 2,5 milhões, "1b" = bilhão.
    const suf = t.match(/^(\d+(?:[.,]\d+)?)(k|mil|m|kk|b)$/)
    if (suf) {
        const base = Number(suf[1].replace(',', '.'))
        const mult = { k: 1e3, mil: 1e3, m: 1e6, kk: 1e6, b: 1e9 }[suf[2]]
        if (!Number.isFinite(base)) return null
        return Math.floor(base * mult)
    }

    // Número puro, tolerando separadores: "1.500.000" e "1500000".
    const limpo = t.replace(/[.\s]/g, '').replace(',', '.')
    const n = Number(limpo)
    if (!Number.isFinite(n)) return null
    return Math.floor(n)
}

/**
 * Valida uma aposta contra o saldo e os limites.
 * @returns {{ok:boolean, erro?:string, valor?:number}}
 */
function validarAposta({ user, texto, min = APOSTA_MINIMA, max = APOSTA_MAXIMA }) {
    const atual = saldo(user)
    const valor = parseValor(texto, atual)

    if (valor === null) {
        return { ok: false, erro: `❌ *Valor inválido.*\n\n📌 Use um número, \`tudo\`, \`metade\`, \`50%\` ou \`1k\`/\`2m\`.` }
    }
    if (valor <= 0) {
        return { ok: false, erro: '❌ *A aposta precisa ser maior que zero.*' }
    }
    if (valor < min) {
        return { ok: false, erro: `❌ *Aposta mínima:* 💰 ${formatar(min)} moedas.` }
    }
    if (valor > max) {
        return { ok: false, erro: `❌ *Aposta máxima:* 💰 ${formatar(max)} moedas.` }
    }
    if (atual <= 0) {
        return { ok: false, erro: '❌ *Você está sem moedas.*\n\n💡 _Use_ `.trabalhar` _ou_ `.premiodiario` _para começar._' }
    }
    if (valor > atual) {
        return {
            ok: false,
            erro: `❌ *Saldo insuficiente.*\n\n💰 Você tem: ${formatar(atual)}\n🎲 Tentou apostar: ${formatar(valor)}`
        }
    }
    return { ok: true, valor }
}

/**
 * Aplica uma variação de saldo e persiste.
 * O saldo nunca fica negativo: um débito maior que o saldo zera a conta em vez
 * de criar dívida invisível.
 *
 * @returns {{antes:number, delta:number, depois:number}}
 */
function aplicar(user, delta) {
    const antes = saldo(user)
    const depois = Math.max(0, Math.floor(antes + delta))
    user.coins = depois
    try {
        dataService.saveUser(user)
    } catch (e) {
        // Persistência é o ponto inteiro deste serviço: se falhar, o comando
        // precisa saber em vez de anunciar um ganho que não existe.
        logger.error(`[ECONOMY] Falha ao salvar saldo de ${user?.jid}: ${e.message}`)
        throw e
    }
    return { antes, delta: depois - antes, depois }
}

function creditar(user, valor) {
    return aplicar(user, Math.abs(Math.floor(valor)))
}

function debitar(user, valor) {
    return aplicar(user, -Math.abs(Math.floor(valor)))
}

/**
 * Resolve uma aposta inteira: valida, aplica e devolve tudo pronto para exibir.
 *
 * `multiplicador` é sobre a APOSTA, não sobre o lucro: 2 devolve o dobro do que
 * foi apostado (lucro = 1x). Perder debita a aposta.
 *
 * @param {object} o
 * @param {string} o.sender
 * @param {string} o.texto      valor digitado ("1500000", "tudo", "50%")
 * @param {boolean} o.ganhou
 * @param {number} [o.multiplicador=2]
 * @returns {{ok:boolean, erro?:string, user?:object, valor?:number, delta?:number, saldo?:number}}
 */
function resolverAposta({ sender, texto, ganhou, multiplicador = 2, min, max }) {
    const user = carregarUsuario(sender)
    const v = validarAposta({ user, texto, min, max })
    if (!v.ok) return { ok: false, erro: v.erro, user }

    const aposta = v.valor
    // Ganhar credita o LUCRO (a aposta nunca chegou a sair da conta).
    const delta = ganhou
        ? Math.floor(aposta * (multiplicador - 1))
        : -aposta

    const r = aplicar(user, delta)
    return { ok: true, user, valor: aposta, delta: r.delta, saldo: r.depois, ganhou }
}

/**
 * Transfere moedas entre dois usuários.
 * Debita e credita em sequência; se o crédito falhar, devolve ao remetente para
 * não sumir com o dinheiro no meio do caminho.
 */
function transferir({ deJid, paraJid, texto, min = 1 }) {
    if (deJid === paraJid) {
        return { ok: false, erro: '❌ *Você não pode transferir para si mesmo.*' }
    }
    const de = carregarUsuario(deJid)
    const v = validarAposta({ user: de, texto, min, max: APOSTA_MAXIMA })
    if (!v.ok) return { ok: false, erro: v.erro }

    const para = carregarUsuario(paraJid)
    const rDe = aplicar(de, -v.valor)
    try {
        const rPara = aplicar(para, v.valor)
        return { ok: true, valor: v.valor, saldoRemetente: rDe.depois, saldoDestinatario: rPara.depois }
    } catch (e) {
        // Estorna: sem isso o valor sai de um lado e não entra no outro.
        logger.error(`[ECONOMY] Crédito falhou; estornando ${v.valor} para ${deJid}`)
        aplicar(de, v.valor)
        return { ok: false, erro: '❌ *Falha na transferência.* Nada foi debitado.' }
    }
}

/** "1h 23min" / "45min" / "30s" — quanto falta para liberar de novo. */
function formatarEspera(ms) {
    const s = Math.ceil(ms / 1000)
    if (s < 60) return `${s}s`
    const m = Math.ceil(s / 60)
    if (m < 60) return `${m}min`
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}min`
}

/**
 * Atividade de coleta: minerar, pescar, abrir baú — ganho com espera.
 *
 * O cooldown fica gravado no próprio usuário (`ultima_<chave>`), então
 * reiniciar o bot não devolve a coleta de graça, como aconteceria com um
 * `Map` em memória.
 *
 * @param {object} o
 * @param {string} o.chave      identificador da atividade (ex.: 'minerardiamante')
 * @param {number} o.cooldownMs
 * @param {number} o.min        ganho mínimo
 * @param {number} o.max        ganho máximo
 * @param {number} [o.chanceVazio=0] probabilidade (0-1) de não achar nada
 * @returns {{ok:boolean, espera?:string, vazio?:boolean, ganho?:number, saldo?:number, user:object}}
 */
function coletar({ sender, chave, cooldownMs, min, max, chanceVazio = 0 }) {
    const user = carregarUsuario(sender)
    const campo = `ultima_${chave}`
    const ultima = Number(user[campo] || 0)
    const decorrido = Date.now() - ultima

    if (ultima && decorrido < cooldownMs) {
        return { ok: false, espera: formatarEspera(cooldownMs - decorrido), user }
    }

    // Marca o uso ANTES de sortear: mesmo voltando de mãos vazias, a espera
    // conta. Sem isso o usuário repetiria até dar sorte, e o cooldown viraria
    // enfeite.
    user[campo] = Date.now()

    if (chanceVazio > 0 && Math.random() < chanceVazio) {
        const r = aplicar(user, 0)
        return { ok: true, vazio: true, ganho: 0, saldo: r.depois, user }
    }

    const ganho = Math.floor(min + Math.random() * (max - min + 1))
    const r = aplicar(user, ganho)
    return { ok: true, vazio: false, ganho, saldo: r.depois, user }
}

/** Cartão de resultado padrão, para os comandos de cassino ficarem iguais. */
function cartaoResultado({ titulo, linhas = [], valor, delta, saldo: saldoFinal, ganhou }) {
    let doc = `╔══════════════════════════════╗\n`
    doc += `║ ${titulo}\n`
    doc += `╚══════════════════════════════╝\n\n`
    for (const l of linhas) doc += `${l}\n`
    if (linhas.length) doc += '\n'
    doc += `🎲 *Aposta:* ${formatar(valor)}\n`
    doc += `${ganhou ? '🎉' : '💀'} *Resultado:* ${delta >= 0 ? '+' : ''}${formatar(delta)} moedas\n`
    doc += `🏦 *Saldo atual:* ${formatar(saldoFinal)} moedas`
    return doc
}

module.exports = {
    carregarUsuario,
    coletar,
    formatarEspera,
    saldo,
    parseValor,
    formatar,
    validarAposta,
    aplicar,
    creditar,
    debitar,
    resolverAposta,
    transferir,
    cartaoResultado,
    APOSTA_MINIMA,
    APOSTA_MAXIMA
}
