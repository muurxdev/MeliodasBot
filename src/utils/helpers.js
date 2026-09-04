const esperar = async (tempo) => new Promise(resolve => setTimeout(resolve, tempo))

function hojeId() {
    const hoje = new Date()
    return `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`
}

function semanaAtual() {
    const agora = new Date()
    const inicioAno = new Date(agora.getFullYear(), 0, 1)
    const dias = Math.floor((agora - inicioAno) / (24 * 60 * 60 * 1000))
    return Math.ceil((dias + inicioAno.getDay() + 1) / 7)
}

function barraXP(atual, level) {
    const max = Math.floor(100 * Math.pow(level, 1.5))
    const porcentagem = Math.min(100, Math.floor((atual / max) * 100))
    const blocos = 10
    const preenchido = Math.floor((porcentagem / 100) * blocos)

    let barra = ''
    for (let i = 0; i < blocos; i++) {
        barra += i < preenchido ? '🟩' : '⬛'
    }

    return `${barra} ${porcentagem}%`
}

// Patente do MUNDO DEV por nível de XP (progressão de carreira em tecnologia).
// NÃO confundir com "Cargo" (dono/admin do grupo) — isto é senioridade de XP.
function getCargo(level) {
    if (level >= 1000) return `🌌 Lenda da Computação (Tier ${Math.floor(level / 100)})`
    if (level >= 500) return `🏛️ CTO Lendário (Tier ${Math.floor(level / 50)})`
    if (level >= 300) return `🧙 Fellow Engineer (Tier ${Math.floor(level / 30)})`
    if (level >= 200) return `🚀 Distinguished Engineer (Tier ${Math.floor(level / 20)})`
    if (level >= 150) return `🏗️ Arquiteto de Software (Tier ${Math.floor(level / 15)})`
    if (level >= 100) return `🌟 Principal Engineer (Tier ${Math.floor(level / 10)})`
    if (level >= 75) return '💎 Staff Engineer'
    if (level >= 50) return '👑 Tech Lead'
    if (level >= 40) return '🔥 Dev Senior'
    if (level >= 30) return '⚡ Dev Pleno'
    if (level >= 20) return '💻 Dev Junior'
    if (level >= 10) return '🧠 Estudante Dev'
    return '👶 Iniciante'
}

function getRank(level) {
    if (level >= 1000) return '🌌 Onipotente'
    if (level >= 500) return '👑 Supremo'
    if (level >= 300) return '🐉 Mítico'
    if (level >= 200) return '⚡ Divino'
    if (level >= 150) return '⚔️ Ancestral'
    if (level >= 100) return '🌟 Celestial'
    if (level >= 75) return '💎 Diamante'
    if (level >= 50) return '👑 Lendário'
    if (level >= 40) return '🔥 Mestre'
    if (level >= 30) return '⚡ Elite'
    if (level >= 20) return '💻 Pro'
    if (level >= 10) return '🧠 Dev'
    return '👶 Iniciante'
}

function getRaridadeItem(itemNome) {
    if (itemNome.includes('💎') || itemNome.includes('🌟') || itemNome.includes('👑')) {
        return '🟡 LENDÁRIO'
    }
    if (itemNome.includes('🟣') || itemNome.includes('🌌') || itemNome.includes('⚫')) {
        return '🟣 ÉPICO'
    }
    if (itemNome.includes('🔵') || itemNome.includes('⚡') || itemNome.includes('🛡️')) {
        return '🔵 RARO'
    }
    if (itemNome.includes('🟢') || itemNome.includes('🪲') || itemNome.includes('🌿')) {
        return '🟢 INCOMUM'
    }
    return '⚪ COMUM'
}

module.exports = {
    esperar,
    hojeId,
    semanaAtual,
    barraXP,
    getCargo,
    getRank,
    getRaridadeItem
}

