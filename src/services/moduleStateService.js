/**
 * Estado de ligar/desligar comandos — camada OPT-IN **POR AMBIENTE** (tudo OFF).
 *
 * Cada ambiente (ESCOPO) tem seu próprio estado, para dar isolamento/segurança:
 *   - grupo  → o JID do grupo (ex.: "1203...@g.us"): vale só naquele grupo
 *   - privado→ "pv": vale para as conversas no privado
 *   - global → "global": só usado como padrão explícito do Dono (raro)
 *
 * Assim `.modulo on all` dentro de um grupo libera SÓ aquele grupo; no PV libera
 * só o PV; e `.modulo on <mod> <idDoGrupo>` mira um grupo específico.
 *
 * Duas granularidades dentro do escopo:
 *   - MÓDULO  (cassino, rpg, downloads…) — liga/desliga um bloco
 *   - COMANDO (override) — força ON/OFF um comando, vencendo o módulo
 *
 * Resolução: override do comando > estado do módulo > DEFAULT_ENABLED (=false)
 *
 * Persistido em `configs`, linha `__command_state__`, settings JSON:
 *   { scopes: { "<jid|pv|global>": { modules: {k:bool}, commands: {n:bool} } } }
 * Memoizado (o gate roda no caminho de toda mensagem).
 *
 * IMPORTANTE: camada GLOBAL do DONO. NÃO substitui o toggle por-grupo dos admins
 * (`.categoria`/`.cmd`), que continua valendo por cima.
 */

const configRepo = require('../database/repositories/configRepository')
const { MODULES, BY_KEY, DEFAULT_ENABLED, resolveModuleKey } = require('../config/modules')
const logger = require('../core/logger')

const STATE_KEY = '__command_state__'
const TTL_MS = 4000
const PV_SCOPE = 'pv'
const GLOBAL_SCOPE = 'global'

let _cache = null
let _at = 0

/**
 * Resolve a chave de escopo a partir do chat.
 * @param {string} chatJid  JID do chat (grupo ou privado)
 * @param {boolean} [isGroup]
 */
function scopeOf(chatJid, isGroup) {
    if (!chatJid) return PV_SCOPE
    const isG = (typeof isGroup === 'boolean') ? isGroup : String(chatJid).endsWith('@g.us')
    return isG ? String(chatJid) : PV_SCOPE
}

function _load() {
    if (_cache && Date.now() - _at < TTL_MS) return _cache
    let state = { scopes: {} }
    try {
        const cfg = configRepo.getConfig(STATE_KEY)
        if (cfg && typeof cfg === 'object') {
            if (cfg.scopes && typeof cfg.scopes === 'object') {
                state.scopes = cfg.scopes
            } else if (cfg.modules || cfg.commands) {
                // Formato antigo (estado único global) → migra para o escopo global.
                state.scopes[GLOBAL_SCOPE] = { modules: cfg.modules || {}, commands: cfg.commands || {} }
            }
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

function _scopeState(scope) {
    const s = _load()
    return s.scopes[scope] || { modules: {}, commands: {} }
}

/**
 * Resolução com FALLBACK para o escopo GLOBAL do Dono.
 *
 * Hierarquia (o primeiro que tiver valor explícito vence):
 *   1. override de comando no escopo específico (grupo/PV)
 *   2. override de comando no escopo GLOBAL
 *   3. estado do módulo no escopo específico
 *   4. estado do módulo no escopo GLOBAL   ← "liberação global" cobre PV + grupos
 *   5. DEFAULT_ENABLED (=false)
 *
 * É isso que faz `.modulo on all global` (ou `.modulo on <mod> global`) liberar de
 * uma vez o PV E todos os grupos — sem deixar de permitir que um grupo/PV específico
 * sobrescreva pontualmente (ex.: desligar cassino só num grupo).
 */

/** @returns {boolean} módulo ligado neste escopo (ou no GLOBAL como fallback)? */
function isModuleEnabled(key, scope = GLOBAL_SCOPE) {
    const st = _scopeState(scope)
    if (typeof st.modules[key] === 'boolean') return st.modules[key]
    if (scope !== GLOBAL_SCOPE) {
        const g = _scopeState(GLOBAL_SCOPE)
        if (typeof g.modules[key] === 'boolean') return g.modules[key]
    }
    return DEFAULT_ENABLED
}

/**
 * @param {object|string} cmd - objeto de comando (preferido) ou nome
 * @param {string} scope - escopo (JID do grupo, 'pv' ou 'global')
 */
function isCommandEnabled(cmd, scope = GLOBAL_SCOPE) {
    const name = (typeof cmd === 'string' ? cmd : (cmd && cmd.name) || '').toLowerCase()
    const st = _scopeState(scope)
    if (name && typeof st.commands[name] === 'boolean') return st.commands[name]
    if (scope !== GLOBAL_SCOPE && name) {
        const g = _scopeState(GLOBAL_SCOPE)
        if (typeof g.commands[name] === 'boolean') return g.commands[name]
    }
    const moduleKey = resolveModuleKey(typeof cmd === 'string' ? { name } : cmd)
    return isModuleEnabled(moduleKey, scope)
}

function _mutate(scope, fn) {
    const state = _load()
    const cur = state.scopes[scope] || { modules: {}, commands: {} }
    const next = fn({ modules: { ...cur.modules }, commands: { ...cur.commands } })
    const scopes = { ...state.scopes, [scope]: next }
    _save({ ...state, scopes })
}

function setModule(key, enabled, scope = GLOBAL_SCOPE) {
    if (!BY_KEY[key]) return { ok: false, reason: `Módulo "${key}" não existe.` }
    _mutate(scope, (s) => { s.modules[key] = !!enabled; return s })
    return { ok: true }
}

function setCommand(name, enabled, scope = GLOBAL_SCOPE) {
    _mutate(scope, (s) => { s.commands[String(name).toLowerCase()] = !!enabled; return s })
    return { ok: true }
}

/** Remove o override de um comando (volta a seguir o módulo). */
function clearCommand(name, scope = GLOBAL_SCOPE) {
    _mutate(scope, (s) => { delete s.commands[String(name).toLowerCase()]; return s })
    return { ok: true }
}

/** Liga TODOS os módulos — somente no escopo informado. */
function enableAll(scope = GLOBAL_SCOPE) {
    const modules = {}
    for (const m of MODULES) modules[m.key] = true
    _mutate(scope, () => ({ modules, commands: {} }))
    return { ok: true }
}

/** Desliga TODOS os módulos — somente no escopo informado. */
function disableAll(scope = GLOBAL_SCOPE) {
    const modules = {}
    for (const m of MODULES) modules[m.key] = false
    _mutate(scope, () => ({ modules, commands: {} }))
    return { ok: true }
}

/** Estado atual dos módulos num escopo (para o comando .modulo). */
function listModules(scope = GLOBAL_SCOPE) {
    return MODULES.map(m => ({ ...m, enabled: isModuleEnabled(m.key, scope) }))
}

/** Overrides por comando num escopo. */
function listCommandOverrides(scope = GLOBAL_SCOPE) {
    return { ..._scopeState(scope).commands }
}

/** Escopos que já têm algum estado salvo (diagnóstico). */
function listScopes() {
    return Object.keys(_load().scopes)
}

function invalidateCache() { _cache = null; _at = 0 }

module.exports = {
    scopeOf,
    isModuleEnabled,
    isCommandEnabled,
    setModule,
    setCommand,
    clearCommand,
    enableAll,
    disableAll,
    listModules,
    listCommandOverrides,
    listScopes,
    invalidateCache,
    STATE_KEY,
    PV_SCOPE,
    GLOBAL_SCOPE
}
