/**
 * MeliodasBot — Command Analytics Repository (SQLite)
 * Métricas e telemetria de uso dos comandos em tempo real
 */

const { getDatabase } = require('../connection');

/**
 * Incrementa a contagem de execução de um comando
 * @param {string} commandName - Nome do comando
 * @param {string} category - Categoria do comando
 */
function recordCommandUsage(commandName, category = 'geral') {
    if (!commandName) return;
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO command_analytics (command_name, category, execution_count, last_used_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(command_name) DO UPDATE SET
            execution_count = execution_count + 1,
            category = excluded.category,
            last_used_at = CURRENT_TIMESTAMP
    `);
    stmt.run(commandName.toLowerCase(), category.toLowerCase());
}

/**
 * Retorna os comandos mais executados
 * @param {number} limit
 * @returns {Array<object>}
 */
function getTopCommands(limit = 10) {
    const db = getDatabase();
    return db.prepare(`
        SELECT command_name, category, execution_count, last_used_at
        FROM command_analytics
        ORDER BY execution_count DESC
        LIMIT ?
    `).all(limit);
}

/**
 * Retorna estatísticas por categoria
 * @returns {Array<object>}
 */
function getCategoryStats() {
    const db = getDatabase();
    return db.prepare(`
        SELECT category, SUM(execution_count) as total_executions, COUNT(command_name) as command_count
        FROM command_analytics
        GROUP BY category
        ORDER BY total_executions DESC
    `).all();
}

/**
 * Retorna o total acumulado de comandos executados
 * @returns {number}
 */
function getTotalExecutions() {
    const db = getDatabase();
    const row = db.prepare(`SELECT SUM(execution_count) as total FROM command_analytics`).get();
    return row?.total || 0;
}

module.exports = {
    recordCommandUsage,
    getTopCommands,
    getCategoryStats,
    getTotalExecutions
};

