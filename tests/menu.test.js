/**
 * BotXP — Testes do menu auto-gerado (Fase 4)
 */

process.env.NODE_ENV = 'test'
process.env.STRICT_COMMANDS = '1'

const assert = require('assert')
const dispatcher = require('../src/handlers/commandDispatcher')
const { buildMenu } = require('../src/services/menuService')
const { CATEGORIES } = require('../src/config/categories')

dispatcher.loadCommands()
const reg = dispatcher.getCommands()

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log(`  ✅ PASS: ${name}`); pass++ }
    catch (e) { console.error(`  ❌ FAIL: ${name}\n     ${e.message}`); fail++ }
}

function listedFor(level) {
    const seen = new Set()
    for (const c of CATEGORIES) {
        let page = 1, tp = 1
        do {
            const m = buildMenu({ category: c.key, page, prefix: '.', userLevel: level, botName: 'B', registry: reg, totalAliases: 0 })
            tp = m.totalPages
            for (const mt of (m.pages[page - 1] || '').matchAll(/`\.([a-z0-9_\-]+)`/gi)) {
                const n = mt[1].toLowerCase()
                if (reg.has(n)) seen.add(n)
            }
            page++
        } while (page <= tp)
    }
    return seen
}

console.log('🧪 Testes do menu auto-gerado (Fase 4)...\n')

test('OWNER vê 100% dos comandos do registro no menu', () => {
    const seen = listedFor(5)
    const missing = [...reg.keys()].filter(n => !seen.has(n))
    assert.strictEqual(missing.length, 0, `não listados: ${missing.slice(0, 10).join(', ')}`)
})

test('membro comum não vê comandos ownerOnly nem adminOnly', () => {
    const seen = listedFor(1)
    const leakedOwner = [...seen].filter(n => reg.get(n)?.ownerOnly)
    const leakedAdmin = [...seen].filter(n => reg.get(n)?.adminOnly)
    assert.strictEqual(leakedOwner.length, 0, `vazou owner: ${leakedOwner.join(', ')}`)
    assert.strictEqual(leakedAdmin.length, 0, `vazou admin: ${leakedAdmin.join(', ')}`)
})

test('página 1 (caption de mídia) nunca passa de 1024 chars', () => {
    for (const c of [...CATEGORIES.map(c => c.key), 'all']) {
        const m = buildMenu({ category: c, page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
        assert.ok(m.pages[0].length <= 1024, `${c} pág1 = ${m.pages[0].length} chars`)
    }
})

test('nenhuma página passa de 4096 chars (limite de texto)', () => {
    for (const c of [...CATEGORIES.map(c => c.key), 'all']) {
        const m = buildMenu({ category: c, page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
        m.pages.forEach((p, i) => assert.ok(p.length <= 4096, `${c} pág${i + 1} = ${p.length} chars`))
    }
})

test('painel principal lista todas as categorias não-vazias', () => {
    const m = buildMenu({ category: null, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
    assert.strictEqual(m.totalPages, 1)
    for (const c of CATEGORIES) {
        assert.ok(m.pages[0].includes(`menu ${c.key}`), `falta categoria ${c.key} no painel`)
    }
})

console.log(`\n📊 Menu: ✅ ${pass}  ❌ ${fail}`)
if (fail > 0) process.exit(1)
