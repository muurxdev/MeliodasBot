/**
 * Módulos ("farms"/blocos) transversais do bot.
 *
 * Diferente de `categories.js` (que espelha as pastas), um MÓDULO agrupa comandos
 * por FUNÇÃO/feature para ligar/desligar em bloco. Todo módulo nasce DESLIGADO
 * (`enabledByDefault: false`) — o dono libera por módulo, por comando (override) ou
 * tudo de uma vez. O estado é resolvido em `moduleStateService.js`.
 *
 * `resolveModuleKey(cmd)` decide o módulo de um comando (override por nome →
 * subcategoria → categoria → fallback).
 */

const MODULES = [
    { key: 'rpg',             emoji: '⚔️',  label: 'RPG & Combate' },
    { key: 'xp',              emoji: '✨',  label: 'XP & Progressão (passivo)' },
    { key: 'economia',        emoji: '💰',  label: 'Economia & Banco' },
    { key: 'cassino',         emoji: '🎰',  label: 'Cassino & Apostas' },
    { key: 'jogos',           emoji: '🎮',  label: 'Jogos' },
    { key: 'diversao',        emoji: '😂',  label: 'Diversão & Social' },
    { key: 'downloads',       emoji: '📥',  label: 'Downloads de Mídia' },
    { key: 'figurinhas',      emoji: '🎨',  label: 'Figurinhas & Edição' },
    { key: 'moderacao',       emoji: '🛡️',  label: 'Moderação' },
    { key: 'mensagens-grupo', emoji: '📣',  label: 'Mensagens & Grupo' },
    { key: 'dev',             emoji: '👨‍💻', label: 'Dev Tools' },
    { key: 'utilidades',      emoji: '🧭',  label: 'Utilidades' },
    { key: 'ia',              emoji: '🧠',  label: 'IA & Pesquisa' },
    { key: 'livros',          emoji: '📚',  label: 'Livros & Materiais' },
    { key: 'perfil',          emoji: '🏆',  label: 'Perfil & Ranking' },
    { key: 'owner',           emoji: '👑',  label: 'Dono & Bot' }
]

const BY_KEY = {}
for (const m of MODULES) BY_KEY[m.key] = m

// Todo módulo começa desligado. (Constante única para não divergir.)
const DEFAULT_ENABLED = false

// Overrides por NOME de comando (têm prioridade sobre categoria/subcategoria).
// Só precisa listar os transversais que não seguem a categoria.
const NAME_TO_MODULE = {}
const addNames = (key, names) => names.forEach(n => { NAME_TO_MODULE[n] = key })

addNames('cassino', [
    'cassino', 'cassinoroyale', 'slots', 'mines', 'crash', 'roleta', 'blackjack',
    'apostar', 'aposta', 'dado', 'dados', 'bingo', 'rifa', 'rifar', 'loteria',
    'megapremio', 'jackpot', 'jogodobicho', 'caraoucoroa', 'plinko', 'dobro',
    'torresorte', 'raspadinha', 'poedeira'
])
addNames('mensagens-grupo', [
    'welcome', 'leave', 'boasvindas', 'despedida', 'agendarmensagem', 'anuncio',
    'anunciooficial', 'hidetag', 'tagall', 'marcar', 'sorteio', 'sorteioavancado',
    'enquete', 'votacao', 'event', 'setrules', 'listaregras', 'setdesc',
    'setnomegrupo', 'setfotogrupo'
])
addNames('ia', ['ia', 'gpt', 'chatgpt', 'gemini', 'imagine', 'dalle', 'ai'])
addNames('figurinhas', [
    'fig', 'figurinha', 'sticker', 'take', 'toimg', 'emojimix', 'meme', 'gif',
    'mirror', 'rotate', 'crop', 'resize', 'enhance', 'filter', 'grayscale',
    'threshold', 'emboss', 'sketch', 'oil', 'pixelart', 'blur', 'sepia', 'invert',
    'wanted', 'wasted', 'triggered', 'circle', 'nobg', 'removerbg', 'pixelar'
])
addNames('livros', ['livro', 'livros', 'livroaleatorio', 'apostila', 'apostilas', 'gutenberg'])

/**
 * Resolve o módulo de um comando.
 * @param {{name?:string, category?:string, subcategory?:string}} cmd
 * @returns {string} chave do módulo
 */
function resolveModuleKey(cmd) {
    if (!cmd) return 'utilidades'
    const name = String(cmd.name || '').toLowerCase()
    if (NAME_TO_MODULE[name]) return NAME_TO_MODULE[name]

    const cat = String(cmd.category || '').toLowerCase()
    const sub = String(cmd.subcategory || '').toLowerCase()

    switch (cat) {
        case 'rpg':
            return 'rpg'
        case 'economy':
            return sub.includes('jog') ? 'cassino' : 'economia'
        case 'fun':
            return (sub.includes('jog') || sub.includes('quiz')) ? 'jogos' : 'diversao'
        case 'media':
            return sub.includes('imag') ? 'figurinhas' : 'downloads'
        case 'dev':
            return 'dev'
        case 'general':
            if (sub.includes('livro')) return 'livros'
            if (sub.includes('perfil') || sub.includes('rank')) return 'perfil'
            return 'utilidades'
        case 'admin':
            if (sub.includes('config')) return 'mensagens-grupo'
            return 'moderacao'
        case 'profile':
            return 'perfil'
        case 'owner':
            return 'owner'
        default:
            return 'utilidades'
    }
}

module.exports = { MODULES, BY_KEY, DEFAULT_ENABLED, NAME_TO_MODULE, resolveModuleKey }
