const { barraXP, getCargo, getRank } = require('../utils/helpers')
const { verificarConquistas } = require('./achievementEngine')

const userRepo = require('../database/repositories/userRepository')

function initializeUser(sender, xpData = {}, alternativeJids = []) {
    let user = xpData[sender]

    if (!user || (user.messages === 0 && user.xp === 0 && user.level === 1)) {
        try {
            const dbUser = userRepo.getUser(sender, alternativeJids)
            if (dbUser && (dbUser.messages > 0 || dbUser.xp > 0 || dbUser.coins > 0 || dbUser.level > 1 || (dbUser.inventario && dbUser.inventario.length > 0))) {
                user = dbUser
            } else if (!user) {
                user = dbUser || {}
            }
        } catch (_) {}
    }

    if (!user) {
        user = {}
    }

    const defaults = {
        jid: sender,
        xp: 0,
        level: 1,
        messages: 0,
        streak: 0,
        coins: 0,
        conquistas: [],
        rep: 0,
        lastDaily: 0,
        inventario: [],
        inventory: [],
        equipado: null,
        arma: null,
        wins: 0,
        losses: 0,
        classe: null,
        classeLendaria: null,
        bugPower: 0,
        pets: [],
        pet: null,
        weeklyXp: 0,
        weeklyCoins: 0,
        messagesGroup: 0,
        messagesPv: 0,
        commandsGroup: 0,
        commandsPv: 0,
        xpGroup: 0,
        xpPv: 0,
        hpMax: 100,
        hp: 100,
        mundo: 'floresta',
        mochila: 20,
        arenaPontos: 0,
        arenaAtual: 1,
        nicknameRpg: null,
        forgeLevel: 0,
        slots: {
            capacete: null,
            peitoral: null,
            calca: null,
            botas: null,
            arma: null,
            escudo: null,
            amuleto: null
        }
    }

    for (const key of Object.keys(defaults)) {
        if (user[key] === undefined || user[key] === null) {
            user[key] = typeof defaults[key] === 'object' && defaults[key] !== null
                ? (Array.isArray(defaults[key]) ? [] : { ...defaults[key] })
                : defaults[key]
        }
    }

    if (typeof user.slots === 'object' && user.slots !== null) {
        user.slots = { ...defaults.slots, ...user.slots }
    }

    if (Array.isArray(user.inventario) && user.inventario.length > 0 && (!Array.isArray(user.inventory) || user.inventory.length === 0)) {
        user.inventory = user.inventario
    } else if (Array.isArray(user.inventory) && user.inventory.length > 0 && (!Array.isArray(user.inventario) || user.inventario.length === 0)) {
        user.inventario = user.inventory
    }

    xpData[sender] = user

    try {
        userRepo.saveUser(user)
    } catch (_) {}

    return user
}

function calcularXpNecessario(level) {
    return Math.floor(100 * Math.pow(level, 1.5))
}

/**
 * Processa a subida de nível e concede marcos de evolução (HP, Coins, Conquistas)
 * @param {object} user - Perfil do usuário
 * @returns {object} { subiu, levelsGanhos, novoLevel, ganhoCoins, ganhoHp, conquistas }
 */
function processarLevelUp(user) {
    let subiu = false
    let levelsGanhos = 0
    let ganhoCoins = 0
    let ganhoHp = 0

    let maxXp = calcularXpNecessario(user.level)

    while ((user.xp || 0) >= maxXp) {
        user.xp -= maxXp
        user.level += 1
        subiu = true
        levelsGanhos += 1

        // Recompensa em coins por nível
        const coinsBonus = user.level * 50
        user.coins = (user.coins || 0) + coinsBonus
        ganhoCoins += coinsBonus

        // Upgrade de HP a cada 5 níveis
        if (user.level % 5 === 0) {
            user.hpMax = (user.hpMax || 100) + 10
            ganhoHp += 10
        }

        // Restaura a vida completa ao subir de nível
        user.hp = user.hpMax || 100

        maxXp = calcularXpNecessario(user.level)
    }

    // Avalia conquistas desbloqueadas
    const conquistas = verificarConquistas(user)

    return {
        subiu,
        levelsGanhos,
        novoLevel: user.level,
        ganhoCoins,
        ganhoHp,
        conquistas
    }
}

module.exports = {
    initializeUser,
    calcularXpNecessario,
    processarLevelUp,
    barraXP,
    getCargo,
    getRank
}
