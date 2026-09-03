/**
 * Testes da camada GLOBAL opt-in (moduleStateService + config/modules).
 * Garante: tudo OFF por padrão, toggle por módulo, override por comando,
 * enableAll/disableAll, e o mapeamento comando→módulo.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const ms = require('../src/services/moduleStateService')
const { resolveModuleKey, MODULES } = require('../src/config/modules')

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes da camada opt-in (módulos)...\n')

// começa limpo
ms.disableAll()

test('tudo OFF por padrão (disableAll)', () => {
    assert.strictEqual(ms.isModuleEnabled('cassino'), false)
    assert.strictEqual(ms.isCommandEnabled('slots'), false)
})

test('ligar um módulo habilita seus comandos', () => {
    ms.setModule('cassino', true)
    assert.strictEqual(ms.isModuleEnabled('cassino'), true)
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }), true)
})

test('outros módulos seguem OFF', () => {
    assert.strictEqual(ms.isCommandEnabled({ name: 'ban', category: 'admin' }), false)
})

test('override por comando (ON) vence módulo OFF', () => {
    ms.setCommand('ban', true)
    assert.strictEqual(ms.isCommandEnabled({ name: 'ban', category: 'admin' }), true)
})

test('override por comando (OFF) vence módulo ON', () => {
    ms.setModule('cassino', true)
    ms.setCommand('slots', false)
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }), false)
})

test('clearCommand remove o override (volta a seguir o módulo)', () => {
    ms.clearCommand('slots')
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }), true)
})

test('enableAll liga todos os módulos', () => {
    ms.enableAll()
    for (const m of MODULES) assert.strictEqual(ms.isModuleEnabled(m.key), true, 'módulo ' + m.key)
})

test('disableAll desliga todos e limpa overrides', () => {
    ms.disableAll()
    for (const m of MODULES) assert.strictEqual(ms.isModuleEnabled(m.key), false, 'módulo ' + m.key)
    assert.deepStrictEqual(ms.listCommandOverrides(), {})
})

test('setModule com chave inválida falha graciosamente', () => {
    const r = ms.setModule('inexistente', true)
    assert.strictEqual(r.ok, false)
})

test('resolveModuleKey mapeia farms transversais', () => {
    assert.strictEqual(resolveModuleKey({ name: 'slots', category: 'economy' }), 'cassino')
    assert.strictEqual(resolveModuleKey({ name: 'welcome', category: 'admin' }), 'mensagens-grupo')
    assert.strictEqual(resolveModuleKey({ name: 'fig', category: 'media' }), 'figurinhas')
    assert.strictEqual(resolveModuleKey({ name: 'banco', category: 'economy' }), 'economia')
    assert.strictEqual(resolveModuleKey({ name: 'ban', category: 'admin' }), 'moderacao')
    assert.strictEqual(resolveModuleKey({ name: 'atacar', category: 'rpg' }), 'rpg')
})

// deixa o banco de teste com tudo OFF (estado neutro)
ms.disableAll()

console.log('\n========================================')
console.log('📊 RESULTADO — Camada opt-in:')
console.log('   ✅ Passaram: ' + pass)
console.log('   ❌ Falharam: ' + fail)
console.log('========================================')
if (fail > 0) process.exit(1)
