/**
 * Rental Repository (SQLite WAL)
 * Gerencia a persistência de aluguéis de grupos com prazos e status
 */

const { getDatabase } = require('../connection')
const logger = require('../../core/logger')

function rowToRental(row) {
    if (!row) return null
    return {
        groupJid: row.group_jid,
        groupName: row.group_name || '',
        renterJid: row.renter_jid || '',
        rentedBy: row.rented_by || '',
        startsAt: Number(row.starts_at),
        expiresAt: Number(row.expires_at),
        isActive: Boolean(row.is_active),
        price: Number(row.price || 0),
        paymentMethod: row.payment_method || 'Pix',
        pixKey: row.pix_key || '',
        notes: row.notes || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}

function getRental(groupJid) {
    try {
        const db = getDatabase()
        const row = db.prepare('SELECT * FROM rentals WHERE group_jid = ?').get(groupJid)
        return rowToRental(row)
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao buscar aluguel:', err)
        return null
    }
}

function getAllRentals() {
    try {
        const db = getDatabase()
        const rows = db.prepare('SELECT * FROM rentals ORDER BY expires_at ASC').all()
        return rows.map(rowToRental)
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao listar aluguéis:', err)
        return []
    }
}

function saveRental(rental) {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO rentals (
                group_jid, group_name, renter_jid, rented_by,
                starts_at, expires_at, is_active, price,
                payment_method, pix_key, notes, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)

        stmt.run(
            rental.groupJid,
            rental.groupName || '',
            rental.renterJid || '',
            rental.rentedBy || '',
            rental.startsAt || Date.now(),
            rental.expiresAt,
            rental.isActive !== false ? 1 : 0,
            rental.price || 0,
            rental.paymentMethod || 'Pix',
            rental.pixKey || '',
            rental.notes || ''
        )
        return true
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao salvar aluguel:', err)
        return false
    }
}

function deleteRental(groupJid) {
    try {
        const db = getDatabase()
        db.prepare('DELETE FROM rentals WHERE group_jid = ?').run(groupJid)
        return true
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao deletar aluguel:', err)
        return false
    }
}

module.exports = {
    getRental,
    getAllRentals,
    saveRental,
    deleteRental,
    rowToRental
}

