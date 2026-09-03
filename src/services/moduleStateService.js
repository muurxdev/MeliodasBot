/**
 * Estado global de ligar/desligar comandos — camada OPT-IN (tudo nasce OFF).
 *
 * Duas granularidades:
 *  - MÓDULO  (ex.: cassino, rpg, downloads) — liga/desliga um bloco inteiro.
 *  - COMANDO (override) — força ON/OFF um comando específico, vencendo o módulo.
 *
 * Resolução de `isCommandEnabled(cmd)`:
 *   override do comando (se existir) > estado do módulo > DEFAULT_ENABLED (=false)
 *
 * Persistido na tabela `configs`, linha `__command_state__`, campo settings JSON:
 *   { modules: { <key>: bool }, commands: { <name>: bool } }
 * Memoizado com TTL curto (o gate roda no caminho de toda mensagem).
 *
 * IMPORTANTE: esta camada é GLOBAL e controlada pelo DONO. NÃO substitui o toggle
 * por-grupo de admins (`.categoria`/`.cmd`), que continua funcionando por cima.
 */

const configRepo = require('../database/repositories/configRepository')
const { MODULES, BY_KEY, DEFAULT_ENABLED, resolveModuleKey } = require('../config/modules')
const logger = require('../core/logger')

const STATE_KEY = '__command_state__'
const TTL_MS = 4000

let _cache = null
let _at = 0

function _load() {
    if (_cache && Date.now() - _at < TTL_MS) return _cache
    let state = { modules: {}, commands: {} }
    try {
        const cfg = configRepo.getConfig(STATE_KEY)
        if (cfg && typeof cfg === 'object') {
            state.modules = (cfg.modules && typeof cfg.modules === 'object') ? cfg.modules : {}
            state.commands = (cfg.commands && typeof cfg.commands === 'object') ? cfg.commands : {}
        }
    } catch (e) {
        logger.warn(`[MODULE STATE] Falha ao ler estado (${e.message}); assumindo tudo OFF.`)
    }
    _cache = state
    _at = Date.now()
    return state
}

function _save(state) {
    try {
        configRepo.saveConfig(STATE_KEY, state)
        _cache = state
        _at = Date.now()
        return true
    } catch (e) {
        logger.error(`[MODULE STATE] Falha ao salvar estado: ${e.message}`)
        return false
    }
}

/** @returns {boolean} módulo ligado? (default: DEFAULT_ENABLED) */
function isModuleEnabled(key) {
    const state = _load()
    if (typeof state.modules[key] === 'boolean') return state.modules[key]
    return DEFAULT_ENABLED
}

/**
 * @param {object|string} cmd - objeto de comando (preferido) ou nome
 * @returns {boolean}
 */
function isCommandEnabled(cmd) {
    const state = _load()
    const name = (typeof cmd === 'string' ? cmd : (cmd && cmd.name) || '').toLowerCase()
    if (name && typeof state.commands[name] === 'boolean') return state.commands[name]
    const moduleKey = resolveModuleKey(typeof cmd === 'string' ? { name } : cmd)
    return isModuleEnabled(moduleKey)
}

function setModule(key, enabled) {
    if (!BY_KEY[key]) return { ok: false, reason: `Módulo "${key}" não existe.` }
    const state = _load()
    state.modules = { ...state.modules, [key]: !!enabled }
    _save(state)
    return { ok: true }
}

function setCommand(name, enabled) {
    const state = _load()
    state.commands = { ...state.commands, [String(name).toLowerCase()]: !!enabled }
    _save(state)
    return { ok: true }
}

/** Remove o override de um comando (volta a seguir o módulo). */
function clearCommand(name) {
    const state = _load()
    const commands = { ...state.commands }
    delete commands[String(name).toLowerCase()]
    _save({ ...state, commands })
    return { ok: true }
}

function enableAll() {
    const modules = {}
    for (const m of MODULES) modules[m.key] = true
    _save({ modules, commands: {} })
    return { ok: true }
}

function disableAll() {
    const modules = {}
    for (const m of MODULES) modules[m.key] = false
    _save({ modules, commands: {} })
    return { ok: true }
}

/** Estado atual dos módulos (para o comando .modulo). */
function listModules() {
    return MODULES.map(m => ({ ...m, enabled: isModuleEnabled(m.key) }))
}

/** Overrides ativos por comando (para diagnóstico). */
function listCommandOverrides() {
    const state = _load()
    return { ...state.commands }
}

function invalidateCache() { _cache = null; _at = 0 }

module.exports = {
    isModuleEnabled,
    isCommandEnabled,
    setModule,
    setCommand,
    clearCommand,
    enableAll,
    disableAll,
    listModules,
    listCommandOverrides,
    invalidateCache,
    STATE_KEY
}
