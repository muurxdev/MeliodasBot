/**
 * Fonte única das categorias de comando (as 9 pastas de src/commands).
 * Consumida pelo gerador de menu e pelos atalhos de categoria do dispatcher.
 *
 * Cada categoria: key (= nome da pasta), emoji, label exibido, e `shortcuts`
 * (o que o usuário pode digitar para abrir o submenu, ex.: `.rpg`, `.eco`).
 */

const CATEGORIES = [
    { key: 'rpg',      emoji: '⚔️',  label: 'RPG & Combates',        shortcuts: ['rpg', 'aventura', 'combate', 'slayer'] },
    { key: 'economy',  emoji: '💰',  label: 'Economia & Cassino',    shortcuts: ['eco', 'economia', 'banco', 'cassino'] },
    { key: 'media',    emoji: '📥',  label: 'Downloads & Mídia',     shortcuts: ['media', 'midia', 'download', 'downloads', 'musica'] },
    { key: 'fun',      emoji: '🎮',  label: 'Diversão & Jogos',      shortcuts: ['fun', 'diversao', 'jogos', 'games'] },
    { key: 'dev',      emoji: '👨‍💻', label: 'Dev Hub & Ferramentas', shortcuts: ['dev', 'desenvolvedor', 'tools', 'software'] },
    { key: 'general',  emoji: '🧭',  label: 'Utilidades & Geral',    shortcuts: ['general', 'geral', 'util', 'utilidades', 'calc', 'calculadora', 'pesquisa', 'ia', 'gpt', 'gemini', 'ping', 'rede', 'interacao', 'social'] },
    { key: 'admin',    emoji: '🛡️',  label: 'Administração',          shortcuts: ['admin', 'adm', 'moderacao', 'config', 'configuracao'] },
    { key: 'profile',  emoji: '🏆',  label: 'Perfil & Ranking',      shortcuts: ['profile', 'perfil', 'rank'] },
    { key: 'owner',    emoji: '👑',  label: 'Donos & Aluguel',       shortcuts: ['owner', 'dono', 'donos', 'aluguel', 'vps'] }
]

// Índice: shortcut (lowercase) -> key da categoria
const SHORTCUT_TO_KEY = {}
for (const c of CATEGORIES) {
    SHORTCUT_TO_KEY[c.key] = c.key
    for (const s of c.shortcuts) SHORTCUT_TO_KEY[s] = c.key
}

// Índice: key -> metadados
const BY_KEY = {}
for (const c of CATEGORIES) BY_KEY[c.key] = c

/** Resolve um atalho digitado para a key da categoria, ou null. */
function resolveCategoryKey(input) {
    if (!input) return null
    const clean = String(input).toLowerCase().trim()
    return SHORTCUT_TO_KEY[clean] || null
}

module.exports = { CATEGORIES, BY_KEY, SHORTCUT_TO_KEY, resolveCategoryKey }
