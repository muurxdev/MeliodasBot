/**
 * MeliodasBot — Central UI & Card Rendering Engine
 * Padronização visual premium, caixas decorativas Unicode perfeitas para WhatsApp
 */

const { getBotName } = require('../config/botConfig');

/**
 * Renderiza uma barra de progresso gráfica
 */
function renderProgressBar(current, max, length = 10, style = 'green') {
    const safeMax = Math.max(1, max);
    const safeCurrent = Math.min(safeMax, Math.max(0, current));
    const percent = Math.min(100, Math.floor((safeCurrent / safeMax) * 100));
    const filledCount = Math.min(length, Math.floor((percent / 100) * length));
    const emptyCount = length - filledCount;

    let fillChar = '🟩';
    let emptyChar = '⬛';

    if (style === 'purple') fillChar = '🟪';
    else if (style === 'blue') fillChar = '🟦';
    else if (style === 'fire') fillChar = '🟧';

    return `${fillChar.repeat(filledCount)}${emptyChar.repeat(emptyCount)} ${percent}%`;
}

/**
 * Formata números com separador de milhar brasileiro
 */
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('pt-BR');
}

function formatCoins(amount) {
    return `${formatNumber(amount)} Coins`;
}

function formatXP(amount) {
    return `${formatNumber(amount)} XP`;
}

function formatCompact(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const n = Number(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n.toString();
}

/**
 * Calcula a largura da borda de um card a partir do texto do título.
 * A borda fixa antiga (28 chars) entortava com títulos longos e sobrava nos curtos.
 * Capada em [24, 38] porque o WhatsApp quebra linhas longas de qualquer forma.
 */
function computeCardWidth(title, icon = '') {
    // conta o comprimento visível aproximado da linha do título
    const visible = `   ${icon} ${String(title).toUpperCase()} ${icon}`.length;
    return Math.max(24, Math.min(38, visible));
}

/**
 * Renderiza um Card/Painel completo decorado em Unicode com layout 100% alinhado
 */
function renderCard({
    title = 'CENTRAL DO BOT',
    icon = '✨',
    subtitle = null,
    sections = [],
    footer = null,
    tip = null,
    hideBranding = false
}) {
    const botName = getBotName();
    const width = computeCardWidth(title, icon);
    const bar = '━'.repeat(width);
    let doc = `┏${bar}┓\n`;
    doc += `┃   ${icon} *${title.toUpperCase()}* ${icon}\n`;
    doc += `┗${bar}┛\n\n`;

    if (subtitle) {
        doc += `${subtitle}\n\n`;
    }

    for (const section of sections) {
        const secTitle = section.title ? `〔 ${section.icon || '📌'} ${section.title.toUpperCase()} 〕` : '〔 📌 INFORMAÇÕES 〕';
        doc += `╭━━━${secTitle}━━━┈⊷\n`;

        if (Array.isArray(section.fields)) {
            for (const field of section.fields) {
                if (typeof field === 'string') {
                    doc += `┃ • ${field.replace(/^[•\s*-]+/, '')}\n`;
                } else if (typeof field === 'object' && field !== null) {
                    const fIcon = field.icon ? `${field.icon} ` : '';
                    const fLabel = field.label ? `*${field.label}:* ` : '';
                    doc += `┃ ${fIcon}${fLabel}${field.value}\n`;
                }
            }
        }
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
    }

    if (footer) {
        doc += `${footer}\n\n`;
    }

    if (tip) {
        doc += `💡 _${tip}_\n`;
    }

    if (!hideBranding) {
        doc += `👑 *${botName}*`;
    }

    return doc.trim();
}

function renderTable(headers = [], rows = []) {
    let out = '';
    const colWidths = headers.map((h, i) => {
        let max = h.length;
        for (const row of rows) {
            const cell = String(row[i] || '');
            if (cell.length > max) max = cell.length;
        }
        return Math.min(25, max);
    });

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');
    const sepLine = colWidths.map(w => '-'.repeat(w)).join('-|-');

    out += headerLine + '\n';
    out += sepLine + '\n';

    for (const row of rows) {
        const rowLine = row.map((c, i) => String(c || '').padEnd(colWidths[i])).join(' | ');
        out += rowLine + '\n';
    }

    return out;
}

module.exports = {
    renderCard,
    computeCardWidth,
    renderProgressBar,
    formatNumber,
    formatCoins,
    formatXP,
    formatCompact,
    renderTable
};
