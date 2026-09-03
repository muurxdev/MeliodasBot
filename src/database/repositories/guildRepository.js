const { getDatabase } = require('../connection')

function rowToGuild(row) {
    if (!row) return null
    return {
        dono: row.dono,
        level: Number(row.level || 1),
        xp: Number(row.xp || 0),
        coins: Number(row.coins || 0),
        membros: JSON.parse(row.membros || '[]')
    }
}

function getGuild(nome) {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM guilds WHERE nome = ?').get(nome)
    return row ? rowToGuild(row) : null
}

function saveGuild(nome, guild) {
    const db = getDatabase()
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO guilds (nome, dono, level, xp, coins, membros)
        VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
        nome,
        guild.dono || '',
        guild.level || 1,
        guild.xp || 0,
        guild.coins || 0,
        JSON.stringify(guild.membros || [])
    )
}

function deleteGuild(nome) {
    const db = getDatabase()
    db.prepare('DELETE FROM guilds WHERE nome = ?').run(nome)
}

function getAllGuilds() {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM guilds').all()
    const result = {}
    for (const row of rows) {
        result[row.nome] = rowToGuild(row)
    }
    return result
}

module.exports = {
    getGuild,
    saveGuild,
    deleteGuild,
    getAllGuilds,
    rowToGuild
}

