/**
 * MeliodasBot — RPG Equipment & Character Engine (Sandbox / MMORPG 2.0)
 * Gerenciamento de slots, armas, armaduras, poder de combate (CP) e cálculo de dano
 */

const ITEMS_DB = {
    // 🗡️ ARMAS (Mão Principal)
    "espada_madeira": { id: "espada_madeira", nome: "Espada de Madeira", slot: "arma", tipo: "Arma", atk: 15, def: 0, hp: 0, crit: 2, preco: 150, raridade: "⚪ Comum", cp: 25 },
    "espada_ferro": { id: "espada_ferro", nome: "Espada de Ferro Britânico", slot: "arma", tipo: "Arma", atk: 55, def: 5, hp: 20, crit: 5, preco: 600, raridade: "🔵 Raro", cp: 110 },
    "lamina_aco": { id: "lamina_aco", nome: "Lâmina de Aço Real", slot: "arma", tipo: "Arma", atk: 140, def: 15, hp: 50, crit: 10, preco: 2500, raridade: "🟣 Épico", cp: 290 },
    "machado_guerra": { id: "machado_guerra", nome: "Machado de Guerra de Danafor", slot: "arma", tipo: "Arma", atk: 280, def: 30, hp: 120, crit: 15, preco: 7500, raridade: "🟣 Épico", cp: 580 },
    "chastiefol": { id: "chastiefol", nome: "Lança Espiritual Chastiefol", slot: "arma", tipo: "Arma", atk: 550, def: 80, hp: 300, crit: 20, preco: 20000, raridade: "🟣 Lendário", cp: 1250 },
    "lostvayne": { id: "lostvayne", nome: "Espada Demoníaca Lostvayne", slot: "arma", tipo: "Arma", atk: 1100, def: 150, hp: 600, crit: 30, preco: 60000, raridade: "👑 Mítico", cp: 2600 },
    "gideon": { id: "gideon", nome: "Martelo Sagrado Gideon", slot: "arma", tipo: "Arma", atk: 1800, def: 350, hp: 1200, crit: 25, preco: 150000, raridade: "👑 Mítico", cp: 4200 },
    "rhitta": { id: "rhitta", nome: "Machado Divino Rhitta", slot: "arma", tipo: "Arma", atk: 4200, def: 800, hp: 3000, crit: 45, preco: 500000, raridade: "🌟 Divino", cp: 9800 },

    // 👑 CAPACETES (Cabeça)
    "capacete_couro": { id: "capacete_couro", nome: "Capacete de Couro", slot: "capacete", tipo: "Elmo", atk: 0, def: 12, hp: 35, preco: 120, raridade: "⚪ Comum", cp: 25 },
    "capacete_ferro": { id: "capacete_ferro", nome: "Capacete de Ferro Forjado", slot: "capacete", tipo: "Elmo", atk: 5, def: 45, hp: 110, preco: 550, raridade: "🔵 Raro", cp: 100 },
    "elmo_cavaleiro": { id: "elmo_cavaleiro", nome: "Elmo do Cavaleiro Sagrado", slot: "capacete", tipo: "Elmo", atk: 15, def: 110, hp: 320, preco: 2200, raridade: "🟣 Épico", cp: 280 },
    "coroa_trevas": { id: "coroa_trevas", nome: "Coroa do Rei Demônio", slot: "capacete", tipo: "Elmo", atk: 80, def: 320, hp: 900, preco: 45000, raridade: "👑 Mítico", cp: 1250 },
    "elmo_arcanjos": { id: "elmo_arcanjos", nome: "Elmo Sagrado dos Arcanjos", slot: "capacete", tipo: "Elmo", atk: 250, def: 850, hp: 2500, preco: 350000, raridade: "🌟 Divino", cp: 4200 },

    // 🛡️ PEITORAIS (Tronco)
    "peitoral_couro": { id: "peitoral_couro", nome: "Túnica de Couro Reforçado", slot: "peitoral", tipo: "Armadura", atk: 0, def: 18, hp: 60, preco: 180, raridade: "⚪ Comum", cp: 35 },
    "peitoral_ferro": { id: "peitoral_ferro", nome: "Peitoral de Ferro Britânico", slot: "peitoral", tipo: "Armadura", atk: 5, def: 75, hp: 200, preco: 800, raridade: "🔵 Raro", cp: 160 },
    "armadura_dourada": { id: "armadura_dourada", nome: "Armadura do Leão Dourado", slot: "peitoral", tipo: "Armadura", atk: 25, def: 220, hp: 650, preco: 4500, raridade: "🟣 Épico", cp: 490 },
    "cota_purgatorio": { id: "cota_purgatorio", nome: "Cota Dracônica do Purgatório", slot: "peitoral", tipo: "Armadura", atk: 120, def: 600, hp: 1800, preco: 65000, raridade: "👑 Mítico", cp: 2100 },
    "manto_divindade": { id: "manto_divindade", nome: "Manto da Divindade Suprema", slot: "peitoral", tipo: "Armadura", atk: 400, def: 1600, hp: 5000, preco: 450000, raridade: "🌟 Divino", cp: 6800 },

    // 👖 CALÇAS (Pernas)
    "calca_couro": { id: "calca_couro", nome: "Calças de Couro Rústico", slot: "calca", tipo: "Perneira", atk: 0, def: 10, hp: 30, preco: 100, raridade: "⚪ Comum", cp: 20 },
    "perneiras_ferro": { id: "perneiras_ferro", nome: "Perneiras de Ferro Maciço", slot: "calca", tipo: "Perneira", atk: 2, def: 40, hp: 120, preco: 500, raridade: "🔵 Raro", cp: 90 },
    "grevas_prata": { id: "grevas_prata", nome: "Grevas de Prata Britânica", slot: "calca", tipo: "Perneira", atk: 15, def: 130, hp: 380, preco: 2400, raridade: "🟣 Épico", cp: 310 },
    "calcas_purgatorio": { id: "calcas_purgatorio", nome: "Perneiras do Purgatório", slot: "calca", tipo: "Perneira", atk: 70, def: 380, hp: 1100, preco: 42000, raridade: "👑 Mítico", cp: 1400 },
    "grevas_luz": { id: "grevas_luz", nome: "Grevas de Luz Arcangélica", slot: "calca", tipo: "Perneira", atk: 220, def: 950, hp: 3000, preco: 320000, raridade: "🌟 Divino", cp: 4500 },

    // 👢 BOTAS (Pés)
    "botas_couro": { id: "botas_couro", nome: "Botas de Couro Simples", slot: "botas", tipo: "Botas", atk: 0, def: 8, hp: 20, esq: 3, preco: 90, raridade: "⚪ Comum", cp: 15 },
    "botas_ferro": { id: "botas_ferro", nome: "Botas de Ferro Pesadas", slot: "botas", tipo: "Botas", atk: 0, def: 30, hp: 70, esq: 5, preco: 450, raridade: "🔵 Raro", cp: 75 },
    "botas_hermes": { id: "botas_hermes", nome: "Botas Aladas de Hermes", slot: "botas", tipo: "Botas", atk: 10, def: 90, hp: 250, esq: 15, preco: 2800, raridade: "🟣 Épico", cp: 290 },
    "botas_sombras": { id: "botas_sombras", nome: "Passos da Sombra Noturna", slot: "botas", tipo: "Botas", atk: 60, def: 250, hp: 750, esq: 28, preco: 38000, raridade: "👑 Mítico", cp: 1200 },
    "passos_celestiais": { id: "passos_celestiais", nome: "Passos Celestiais da Luz", slot: "botas", tipo: "Botas", atk: 180, def: 650, hp: 2000, esq: 45, preco: 290000, raridade: "🌟 Divino", cp: 3800 },

    // 🛡️ ESCUDOS (Mão Secundária)
    "escudo_madeira": { id: "escudo_madeira", nome: "Escudo de Madeira Reforçado", slot: "escudo", tipo: "Escudo", atk: 0, def: 20, hp: 50, bloq: 8, preco: 140, raridade: "⚪ Comum", cp: 30 },
    "escudo_ferro": { id: "escudo_ferro", nome: "Escudo de Ferro Cruzado", slot: "escudo", tipo: "Escudo", atk: 5, def: 70, hp: 180, bloq: 18, preco: 700, raridade: "🔵 Raro", cp: 150 },
    "escudo_fenix": { id: "escudo_fenix", nome: "Broquel da Fênix Imortal", slot: "escudo", tipo: "Escudo", atk: 30, def: 240, hp: 700, bloq: 32, preco: 5000, raridade: "🟣 Épico", cp: 550 },
    "espelho_divino": { id: "espelho_divino", nome: "Escudo Espelho da Deusa", slot: "escudo", tipo: "Escudo", atk: 150, def: 750, hp: 2200, bloq: 55, preco: 70000, raridade: "👑 Mítico", cp: 2500 },

    // 💍 AMULETOS (Acessório)
    "amuleto_cobre": { id: "amuleto_cobre", nome: "Amuleto de Cobre Antigo", slot: "amuleto", tipo: "Acessório", atk: 8, def: 8, hp: 25, preco: 110, raridade: "⚪ Comum", cp: 20 },
    "anel_safira": { id: "anel_safira", nome: "Anel de Safira Mágica", slot: "amuleto", tipo: "Acessório", atk: 35, def: 35, hp: 120, preco: 650, raridade: "🔵 Raro", cp: 120 },
    "colar_dragao": { id: "colar_dragao", nome: "Colar do Dragão da Ira", slot: "amuleto", tipo: "Acessório", atk: 140, def: 140, hp: 450, preco: 4800, raridade: "🟣 Épico", cp: 480 },
    "anel_eternidade": { id: "anel_eternidade", nome: "Anel da Eternidade Mágica", slot: "amuleto", tipo: "Acessório", atk: 450, def: 450, hp: 1600, preco: 85000, raridade: "👑 Mítico", cp: 2200 },
    "orbe_divina": { id: "orbe_divina", nome: "Orbe Celestial da Criação", slot: "amuleto", tipo: "Acessório", atk: 1200, def: 1200, hp: 4500, preco: 500000, raridade: "🌟 Divino", cp: 7500 }
};

function getItem(itemIdOrName) {
    if (!itemIdOrName) return null;
    const clean = String(itemIdOrName).toLowerCase().replace(/[\s_-]/g, "");
    for (const key of Object.keys(ITEMS_DB)) {
        const item = ITEMS_DB[key];
        const cleanKey = key.replace(/[\s_-]/g, "");
        const cleanName = item.nome.toLowerCase().replace(/[\s_-]/g, "");
        if (cleanKey === clean || cleanName.includes(clean) || clean.includes(cleanKey)) {
            return item;
        }
    }
    return null;
}

function calculateCharacterStats(user) {
    const { calculateFullCharacterStats } = require('./characterEngine');
    return calculateFullCharacterStats(user);
}

module.exports = {
    ITEMS_DB,
    getItem,
    calculateCharacterStats
};

