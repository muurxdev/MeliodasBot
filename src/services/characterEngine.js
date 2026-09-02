/**
 * MeliodasBot — Character Engine & Procedural Visual Avatar
 * Responsável por:
 * 1. Renderização visual do Boneco de Emoji com níveis de armadura e equipamentos.
 * 2. Cálculo matemático completo e honesto de atributos, dano explosivo, fogueira, pets e títulos.
 * 3. Mecânica balanceada de Rebirth (Nível 100+ -> Nível 1, Mundo 1, +25% DMG/XP perpétuo).
 */

const { getItem, ITEMS_DB } = require('./rpgEquipmentService');
const { petsDisponiveis } = require('../utils/constants');

const RACES = {
    humano: { id: 'humano', nome: 'Humano', emoji: '🧑', bonusAtk: 10, bonusHp: 50, desc: 'Equilíbrio e rápida evolução' },
    demonio: { id: 'demonio', nome: 'Clã dos Demônios', emoji: '😈', bonusAtk: 40, bonusHp: 120, desc: 'Dano destrutivo e Chamas Negras' },
    deusa: { id: 'deusa', nome: 'Clã das Deusas', emoji: '👼', bonusAtk: 20, bonusHp: 200, desc: 'Alta regeneração e Luz Arcangélica' },
    fada: { id: 'fada', nome: 'Clã das Fadas', emoji: '🧚', bonusAtk: 30, bonusHp: 80, desc: 'Agilidade mágica e telecinese' },
    gigante: { id: 'gigante', nome: 'Clã dos Gigantes', emoji: '🗿', bonusAtk: 50, bonusHp: 350, desc: 'Força bruta e criação da terra' }
};

const ELEMENTS = {
    fogo: { id: 'fogo', nome: 'Fogo do Purgatório', emoji: '🔥', desc: 'Dano contínuo de queimadura' },
    luz: { id: 'luz', nome: 'Luz Celestial', emoji: '✨', desc: 'Penetração de defesa e cura' },
    trevas: { id: 'trevas', nome: 'Trevas Absolutas', emoji: '🌑', desc: 'Roubo de vida e dano crítico' },
    raio: { id: 'raio', nome: 'Relâmpago Sagrado', emoji: '⚡', desc: 'Ataques rápidos e múltiplos' },
    terra: { id: 'terra', nome: 'Criação Terrestre', emoji: '🌍', desc: 'Escudo e defesa inabalável' }
};

/**
 * Renderiza o boneco de emoji customizado com todas as peças visíveis
 */
function renderCharacterAvatar(user, stats = null) {
    const calculatedStats = stats || calculateFullCharacterStats(user);
    const slots = user.slots || {};

    // 1. Cabeça / Elmo
    let headVisual = '👤';
    const helm = slots.capacete ? (typeof slots.capacete === 'object' ? slots.capacete : getItem(slots.capacete)) : null;
    if (helm) {
        if (helm.raridade?.includes('Divino') || helm.raridade?.includes('Mítico')) headVisual = '👑';
        else if (helm.raridade?.includes('Épico')) headVisual = '🪖';
        else headVisual = '🧢';
    }

    // 2. Mãos / Arma & Escudo
    let weaponVisual = '👊';
    const weapon = (slots.arma || user.arma) ? (typeof slots.arma === 'object' ? slots.arma : getItem(slots.arma || user.arma)) : null;
    if (weapon) {
        if (weapon.nome?.includes('Lostvayne') || weapon.nome?.includes('Lâmina')) weaponVisual = '🗡️';
        else if (weapon.nome?.includes('Machado') || weapon.nome?.includes('Rhitta')) weaponVisual = '🪓';
        else if (weapon.nome?.includes('Chastiefol') || weapon.nome?.includes('Lança')) weaponVisual = '🔱';
        else if (weapon.nome?.includes('Martelo') || weapon.nome?.includes('Gideon')) weaponVisual = '🔨';
        else weaponVisual = '⚔️';
    }

    let shieldVisual = '🛡️';
    const shield = slots.escudo ? (typeof slots.escudo === 'object' ? slots.escudo : getItem(slots.escudo)) : null;
    if (!shield) shieldVisual = '';

    // 3. Tronco / Corpo / Raça
    const raceKey = (user.characterRace || user.character_race || 'humano').toLowerCase();
    const raceInfo = RACES[raceKey] || RACES.humano;
    let bodyEmoji = raceInfo.emoji;

    if (user.classe === 'arquimago') bodyEmoji = '🧙‍♂️';
    else if (user.classe === 'guardiao') bodyEmoji = '🛡️🧔';
    else if (user.classe === 'necromante') bodyEmoji = '💀';
    else if (user.classeLendaria === 'meliodas_assault') bodyEmoji = '👑😈';
    else if (user.classeLendaria === 'pecado_ira') bodyEmoji = '🐉🧒';

    // 4. Aura e Asas
    let auraLeft = '✨';
    let auraRight = '✨';
    const rebirths = Number(user.rebirthCount || user.rebirth_count || 0);
    if (rebirths >= 5) {
        auraLeft = '🪽⚡';
        auraRight = '⚡🪽';
    } else if (rebirths >= 1) {
        auraLeft = '🌟';
        auraRight = '🌟';
    }

    // 5. Pernas e Botas
    let feetVisual = '👞';
    const boots = slots.botas ? (typeof slots.botas === 'object' ? slots.botas : getItem(slots.botas)) : null;
    if (boots) {
        if (boots.raridade?.includes('Divino')) feetVisual = '✨👢';
        else feetVisual = '👢';
    }

    // 6. Pet
    let petVisual = '';
    if (user.pet && petsDisponiveis[user.pet]) {
        petVisual = `\n🐾 *Companheiro:* ${user.pet}`;
    }

    const forgeStr = (user.forgeLevel || user.forge_level) ? ` (+${user.forgeLevel || user.forge_level} Forja)` : '';

    let boneco = `     ${headVisual}  ${helm ? `[${helm.nome}]` : '[Sem Elmo]'}\n`;
    boneco += `  ${auraLeft}${bodyEmoji} ${weaponVisual}  [${weapon ? weapon.nome : 'Punhos'}]${shieldVisual ? ` ${shieldVisual}` : ''}\n`;
    boneco += `     ${feetVisual}  [Nível ${user.level || 1}${forgeStr}]${petVisual}`;

    return boneco;
}

/**
 * Calcula os atributos totais do personagem com integração de todos os sistemas
 */
function calculateFullCharacterStats(user) {
    const level = Math.max(1, Number(user.level || 1));
    const slots = user.slots || {};

    let totalAtk = 15 + (level * 6);
    let totalDef = 10 + (level * 4);
    let totalHpMax = 120 + (level * 25);
    let totalCrit = 5;
    let totalEsq = 2;
    let totalBloq = 2;
    let totalCp = 60 + (level * 35);

    // 1. Slots de Equipamentos
    for (const slotKey of Object.keys(slots)) {
        const itemRef = slots[slotKey];
        if (itemRef) {
            const item = typeof itemRef === 'object' ? itemRef : getItem(itemRef);
            if (item) {
                totalAtk += (item.atk || 0);
                totalDef += (item.def || 0);
                totalHpMax += (item.hp || 0);
                totalCrit += (item.crit || 0);
                totalEsq += (item.esq || 0);
                totalBloq += (item.bloq || 0);
                totalCp += (item.cp || 0);
            }
        }
    }

    // Fallback arma legada
    if (!slots.arma && user.arma) {
        const legacy = getItem(user.arma);
        if (legacy) {
            totalAtk += legacy.atk || 0;
            totalDef += legacy.def || 0;
            totalHpMax += legacy.hp || 0;
            totalCp += legacy.cp || 0;
        }
    }

    // Suporte a itens legados em user.equipado
    if (user.equipado) {
        if (user.equipado === '⚔️ Espada de Bug') totalAtk += 150;
        if (user.equipado === '🔱 Lança do Void') totalAtk += 300;
        if (user.equipado === '🔥 Espada Flamejante') totalAtk += 250;
        if (user.equipado === '🐉 Pulseira Dracônica') totalAtk += 400;
        if (user.equipado === '👑 Coroa do Poder Supremo') totalAtk += 500;
        if (user.equipado === '🌑 Manto das Sombras') totalAtk += 200;
        if (user.equipado === '🛡️ Armadura de Firewall') totalDef += 25;
        if (user.equipado === '🔐 Armadura Criptografada') totalDef += 80;
        if (user.equipado === '⏳ Escudo Temporal') totalDef += 120;
    }

    // 2. Nível de Forja / Refinamento Aprimorado (+50 ATK, +35 DEF, +120 HP, +250 CP)
    const forgeLevel = Math.max(0, Number(user.forgeLevel || user.forge_level || 0));
    if (forgeLevel > 0) {
        totalAtk += forgeLevel * 50;
        totalDef += forgeLevel * 35;
        totalHpMax += forgeLevel * 120;
        totalCp += forgeLevel * 250;
    }

    // 3. Raça
    const raceKey = (user.characterRace || user.character_race || 'humano').toLowerCase();
    const race = RACES[raceKey] || RACES.humano;
    totalAtk += race.bonusAtk;
    totalHpMax += race.bonusHp;

    // 4. Rebirths (+25% Dano e +25% Atributos por Rebirth)
    const rebirths = Math.min(10, Math.max(0, Number(user.rebirthCount || user.rebirth_count || 0)));
    const rebirthMultiplier = 1 + (rebirths * 0.25);
    totalAtk = Math.floor(totalAtk * rebirthMultiplier);
    totalDef = Math.floor(totalDef * rebirthMultiplier);
    totalHpMax = Math.floor(totalHpMax * rebirthMultiplier);
    totalCp = Math.floor(totalCp * rebirthMultiplier);

    // 5. Pets Ativos
    if (user.pet && petsDisponiveis[user.pet]) {
        const p = petsDisponiveis[user.pet];
        if (p.tipo === 'dano') totalAtk += (p.valor || 100);
        else if (p.tipo === 'critico') totalCrit += 15;
    }

    // 6. Runas Ativas
    const runes = Array.isArray(user.activeRunes || user.active_runes) ? (user.activeRunes || user.active_runes) : [];
    for (const rune of runes) {
        if (rune.atk) totalAtk += rune.atk;
        if (rune.def) totalDef += rune.def;
        if (rune.crit) totalCrit += rune.crit;
        if (rune.hp) totalHpMax += rune.hp;
    }

    // 7. Buff de Fogueira Ativo (+20% ATK temporário)
    const fogueiraExp = Number(user.fogueiraBuffExpira || user.fogueira_buff_expira || 0);
    const hasFogueira = fogueiraExp > Date.now();
    if (hasFogueira) {
        totalAtk = Math.floor(totalAtk * 1.20);
    }

    return {
        atk: totalAtk,
        def: totalDef,
        hpMax: totalHpMax,
        crit: Math.min(85, totalCrit),
        esq: Math.min(65, totalEsq),
        bloq: Math.min(80, totalBloq),
        cp: totalCp,
        rebirths,
        rebirthMultiplier,
        hasFogueira,
        race: race.nome,
        element: (user.characterElement || user.character_element || 'Fogo')
    };
}

/**
 * Informações e regras de Rebirth
 */
function getRebirthInfo(user) {
    const rebirths = Math.min(10, Math.max(0, Number(user.rebirthCount || user.rebirth_count || 0)));
    const level = Number(user.level || 1);
    const requiredLevel = 100;
    const canRebirth = level >= requiredLevel && rebirths < 10;
    const isMaxRebirth = rebirths >= 10;

    return {
        rebirths,
        maxRebirths: 10,
        requiredLevel,
        currentLevel: level,
        canRebirth,
        isMaxRebirth,
        bonusDmgPercent: rebirths * 25,
        bonusXpPercent: rebirths * 25,
        nextBonusDmgPercent: (rebirths + 1) * 25
    };
}

module.exports = {
    RACES,
    ELEMENTS,
    renderCharacterAvatar,
    calculateFullCharacterStats,
    getRebirthInfo
};

