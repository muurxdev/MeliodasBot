const logger = require('../core/logger')

const migrations = [
    {
        id: '001_initial_schema',
        description: 'Criação inicial das tabelas do sistema',
        up: (db) => {
            // Tabela de Usuários / Jogadores
            db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    jid TEXT PRIMARY KEY,
                    xp INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    messages INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    rep INTEGER DEFAULT 0,
                    streak INTEGER DEFAULT 0,
                    hp INTEGER DEFAULT 100,
                    hp_max INTEGER DEFAULT 100,
                    mundo TEXT DEFAULT 'floresta',
                    mochila INTEGER DEFAULT 20,
                    classe TEXT,
                    classe_lendaria TEXT,
                    bug_power INTEGER DEFAULT 0,
                    pet TEXT,
                    equipado TEXT,
                    arma TEXT,
                    guilda TEXT,
                    wins INTEGER DEFAULT 0,
                    losses INTEGER DEFAULT 0,
                    bosses_mortos INTEGER DEFAULT 0,
                    arena_pontos INTEGER DEFAULT 0,
                    arena_atual INTEGER DEFAULT 1,
                    last_daily INTEGER DEFAULT 0,
                    weekly_xp INTEGER DEFAULT 0,
                    weekly_coins INTEGER DEFAULT 0,
                    pocao_ativa_tipo TEXT,
                    pocao_ativa_expira INTEGER,
                    inventario TEXT DEFAULT '[]',
                    conquistas TEXT DEFAULT '[]',
                    pets TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Índices para consultas de rankings rápidas
            db.exec(`
                CREATE INDEX IF NOT EXISTS idx_users_xp_level ON users (level DESC, xp DESC);
                CREATE INDEX IF NOT EXISTS idx_users_coins ON users (coins DESC);
                CREATE INDEX IF NOT EXISTS idx_users_weekly_xp ON users (weekly_xp DESC);
                CREATE INDEX IF NOT EXISTS idx_users_arena_pontos ON users (arena_pontos DESC);
            `)

            // Tabela de Guildas
            db.exec(`
                CREATE TABLE IF NOT EXISTS guilds (
                    nome TEXT PRIMARY KEY,
                    dono TEXT NOT NULL,
                    level INTEGER DEFAULT 1,
                    xp INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    membros TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Advertências
            db.exec(`
                CREATE TABLE IF NOT EXISTS warns (
                    jid TEXT PRIMARY KEY,
                    count INTEGER DEFAULT 0,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Configurações de Grupos
            db.exec(`
                CREATE TABLE IF NOT EXISTS configs (
                    group_jid TEXT PRIMARY KEY,
                    antilink INTEGER DEFAULT 0,
                    settings TEXT DEFAULT '{}',
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Missões Diárias
            db.exec(`
                CREATE TABLE IF NOT EXISTS missions (
                    jid TEXT PRIMARY KEY,
                    dia TEXT NOT NULL,
                    tipo TEXT,
                    titulo TEXT,
                    descricao TEXT,
                    meta INTEGER DEFAULT 0,
                    xp INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    progresso INTEGER DEFAULT 0,
                    concluida INTEGER DEFAULT 0,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Lutas de Boss
            db.exec(`
                CREATE TABLE IF NOT EXISTS boss_fights (
                    id TEXT PRIMARY KEY,
                    dono TEXT NOT NULL,
                    boss_id TEXT NOT NULL,
                    nome TEXT NOT NULL,
                    tipo TEXT NOT NULL,
                    raridade TEXT NOT NULL,
                    vida INTEGER NOT NULL,
                    vida_max INTEGER NOT NULL,
                    multiplicador REAL DEFAULT 1.0,
                    efeito TEXT,
                    ativo INTEGER DEFAULT 1,
                    dano_map TEXT DEFAULT '{}',
                    loot_list TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Equipamentos Craftados
            db.exec(`
                CREATE TABLE IF NOT EXISTS crafts (
                    jid TEXT NOT NULL,
                    item_nome TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (jid, item_nome)
                );
            `)
        }
    },
    {
        id: '002_security_schema',
        description: 'Criação de tabelas de segurança, blacklist e configurações de sistema',
        up: (db) => {
            // Tabela de Blacklist Global (Usuários Banidos)
            db.exec(`
                CREATE TABLE IF NOT EXISTS blacklist (
                    jid TEXT PRIMARY KEY,
                    motivo TEXT,
                    autor TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Configurações Globais do Sistema (ex: maintenanceMode)
            db.exec(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    chave TEXT PRIMARY KEY,
                    valor TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)
        }
    },
    {
        id: '003_owner_security_hierarchy',
        description: 'Criação de tabelas de hierarquia de cargos (roles), restrições de DM, status e lista trust',
        up: (db) => {
            // Tabela de Cargos e Permissões (OWNER, BOT_ADMIN, TRUSTED)
            db.exec(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    jid TEXT PRIMARY KEY,
                    role TEXT NOT NULL,
                    assigned_by TEXT,
                    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Restrições de Interação via DM (.bandm)
            db.exec(`
                CREATE TABLE IF NOT EXISTS dm_restrictions (
                    jid TEXT PRIMARY KEY,
                    blocked INTEGER DEFAULT 1,
                    reason TEXT,
                    blocked_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Restrições de Marcação em Status (.banstatus)
            db.exec(`
                CREATE TABLE IF NOT EXISTS status_restrictions (
                    jid TEXT PRIMARY KEY,
                    blocked INTEGER DEFAULT 1,
                    reason TEXT,
                    blocked_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Usuários Confiáveis (.trust)
            db.exec(`
                CREATE TABLE IF NOT EXISTS trust_list (
                    jid TEXT PRIMARY KEY,
                    added_by TEXT,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)
        }
    },
    {
        id: '004_bot_lifecycle_schedules',
        description: 'Tabelas persistentes de agendamento de ciclo de vida e estado operacional do bot',
        up: (db) => {
            // Tabela de Agendamentos do Ciclo de Vida
            db.exec(`
                CREATE TABLE IF NOT EXISTS bot_schedules (
                    id TEXT PRIMARY KEY,
                    action TEXT NOT NULL,
                    execute_at INTEGER,
                    reopen_at INTEGER,
                    mode TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    created_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Estado Operacional Atual (ONLINE, OFFLINE, MAINTENANCE, etc)
            db.exec(`
                CREATE TABLE IF NOT EXISTS bot_state (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Inicializa estado padrão ONLINE se não existir
            db.exec(`
                INSERT OR IGNORE INTO bot_state (key, value) VALUES ('operational_state', 'ONLINE');
            `)
        }
    },
    {
        id: '005_rentals_schema',
        description: 'Tabela de gerenciamento de aluguel de grupos com limites de tempo e pagamento',
        up: (db) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS rentals (
                    group_jid TEXT PRIMARY KEY,
                    group_name TEXT,
                    renter_jid TEXT,
                    rented_by TEXT,
                    starts_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    price REAL DEFAULT 0,
                    payment_method TEXT DEFAULT 'Pix',
                    pix_key TEXT,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_rentals_expires ON rentals (expires_at);
                CREATE INDEX IF NOT EXISTS idx_rentals_active ON rentals (is_active);
            `)
        }
    },
    {
        id: '006_user_stats_breakdown',
        description: 'Colunas de estatísticas detalhadas de mensagens, comandos e XP em PV vs Grupo',
        up: (db) => {
            const columnsToAdd = [
                'messages_group INTEGER DEFAULT 0',
                'messages_pv INTEGER DEFAULT 0',
                'commands_group INTEGER DEFAULT 0',
                'commands_pv INTEGER DEFAULT 0',
                'xp_group INTEGER DEFAULT 0',
                'xp_pv INTEGER DEFAULT 0'
            ]
            for (const col of columnsToAdd) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${col};`)
                } catch (_) {}
            }
        }
    },
    {
        id: '007_user_real_telemetry_and_profile',
        description: 'Colunas de dados reais persistentes de telemetria, dispositivo, rede, banco e vinculação LID/PN',
        up: (db) => {
            const columns = [
                'bank INTEGER DEFAULT 0',
                'name TEXT',
                'last_device TEXT',
                'last_ping_ms INTEGER DEFAULT 0',
                'net_type TEXT',
                'last_seen INTEGER DEFAULT 0',
                'phone TEXT',
                'lid TEXT'
            ]
            for (const col of columns) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${col};`)
                } catch (_) {}
            }
            try {
                db.exec(`CREATE INDEX IF NOT EXISTS idx_users_bank ON users (bank DESC);`)
                db.exec(`CREATE INDEX IF NOT EXISTS idx_users_lid ON users (lid);`)
            } catch (_) {}
        }
    },
    {
        id: '008_user_profile_name',
        description: 'Coluna para armazenar o nome de perfil/pushName real do usuário',
        up: (db) => {
            try {
                db.exec(`ALTER TABLE users ADD COLUMN name TEXT;`)
            } catch (_) {}
        }
    },
    {
        id: '009_rpg_slots_and_forge_persistence',
        description: 'Colunas de slots de equipamento, nível de forja e atributos persistentes de RPG',
        up: (db) => {
            const columns = [
                'slots TEXT DEFAULT \'{"capacete":null,"peitoral":null,"calca":null,"botas":null,"arma":null,"escudo":null,"amuleto":null}\'',
                'forge_level INTEGER DEFAULT 0',
                'nickname_rpg TEXT',
                'atk INTEGER DEFAULT 10',
                'def INTEGER DEFAULT 5'
            ]
            for (const col of columns) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${col};`)
                } catch (_) {}
            }
        }
    },
    {
        id: '010_advanced_economy_and_achievements',
        description: 'Tabelas de histórico de transações financeiras, telemetria de comandos, títulos e conquistas RPG',
        up: (db) => {
            // Histórico de transações financeiras
            db.exec(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    user_jid TEXT NOT NULL,
                    target_jid TEXT,
                    type TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    balance_after INTEGER,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_trans_user ON transactions (user_jid, created_at DESC);
            `)

            // Telemetria de Comandos
            db.exec(`
                CREATE TABLE IF NOT EXISTS command_analytics (
                    command_name TEXT PRIMARY KEY,
                    category TEXT,
                    execution_count INTEGER DEFAULT 0,
                    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Catálogo de Títulos RPG
            db.exec(`
                CREATE TABLE IF NOT EXISTS titles (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    rarity TEXT NOT NULL,
                    bonus_atk INTEGER DEFAULT 0,
                    bonus_def INTEGER DEFAULT 0,
                    bonus_cp INTEGER DEFAULT 0,
                    requirement TEXT
                );
            `)

            // Títulos desbloqueados por usuários
            db.exec(`
                CREATE TABLE IF NOT EXISTS user_titles (
                    user_jid TEXT NOT NULL,
                    title_id TEXT NOT NULL,
                    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_jid, title_id)
                );
                CREATE INDEX IF NOT EXISTS idx_user_titles ON user_titles (user_jid);
            `)
        }
    },
    {
        id: '011_rpg_master_overhaul_vault_and_stats',
        description: 'Tabela de Baú persistente (vault_items) e colunas de rebirth, runas, grimório e farm PV vs Grupo',
        up: (db) => {
            // Tabela de Baú de Retaguarda
            db.exec(`
                CREATE TABLE IF NOT EXISTS vault_items (
                    id TEXT PRIMARY KEY,
                    user_jid TEXT NOT NULL,
                    item_id TEXT NOT NULL,
                    item_name TEXT NOT NULL,
                    quantity INTEGER DEFAULT 1,
                    item_type TEXT DEFAULT 'equipment',
                    metadata TEXT DEFAULT '{}',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_vault_user ON vault_items (user_jid);
            `);

            const cols = [
                'vault_coins INTEGER DEFAULT 0',
                'rebirth_count INTEGER DEFAULT 0',
                'grimoire_spells TEXT DEFAULT \'[]\'',
                'active_runes TEXT DEFAULT \'[]\'',
                'character_race TEXT DEFAULT \'humano\'',
                'character_element TEXT DEFAULT \'fogo\'',
                'fogueira_buff_expira INTEGER DEFAULT 0',
                'pv_farm_count INTEGER DEFAULT 0',
                'group_farm_count INTEGER DEFAULT 0',
                'coins_pv INTEGER DEFAULT 0',
                'coins_group INTEGER DEFAULT 0'
            ];
            for (const c of cols) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${c};`);
                } catch (_) {}
            }
        }
    },
    {
        id: '012_repair_created_at_and_indexes',
        description: 'Repara created_at destruído pelo antigo INSERT OR REPLACE, adiciona índices reais e purga schedules cancelados',
        up: (db) => {
            // created_at foi reescrito com CURRENT_TIMESTAMP a cada save no modelo
            // antigo. A data exata é irrecuperável; a melhor aproximação é o menor
            // timestamp conhecido da linha (created_at nunca deve ser > updated_at).
            try {
                db.exec(`
                    UPDATE users
                    SET created_at = updated_at
                    WHERE updated_at IS NOT NULL AND created_at > updated_at;
                `);
            } catch (_) {}

            // Índices para consultas que hoje fazem full scan.
            db.exec(`CREATE INDEX IF NOT EXISTS idx_schedules_status ON bot_schedules (status, execute_at);`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_category ON command_analytics (category);`);

            // bot_schedules acumulava sem retenção (todas as linhas CANCELLED).
            try {
                db.exec(`DELETE FROM bot_schedules WHERE status = 'CANCELLED';`);
            } catch (_) {}
        }
    },
    {
        id: '013_user_identities',
        description: 'Tabela de reconciliação de identidade LID↔JID↔telefone (fundação para merge futuro)',
        up: (db) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS user_identities (
                    jid TEXT PRIMARY KEY,
                    lid TEXT,
                    phone_digits TEXT,
                    linked_jid TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_identities_lid ON user_identities (lid);
                CREATE INDEX IF NOT EXISTS idx_identities_phone ON user_identities (phone_digits);
                CREATE INDEX IF NOT EXISTS idx_identities_linked ON user_identities (linked_jid);
            `);
        }
    },
    {
        id: '014_user_login_profile',
        description: 'Perfil de login: registro, nick de exibição, opt-in de RPG e categoria de foco',
        up: (db) => {
            const cols = [
                'registered INTEGER DEFAULT 0',
                'display_nick TEXT',
                'rpg_enabled INTEGER DEFAULT 1',
                'foco_categoria TEXT',
                'registered_at DATETIME'
            ]
            for (const c of cols) {
                try { db.exec(`ALTER TABLE users ADD COLUMN ${c};`) } catch (_) {}
            }
            // Grandfathering: usuários que já têm atividade entram como registrados
            // (não são obrigados a re-logar), herdando o nome como nick.
            try {
                db.exec(`
                    UPDATE users
                    SET registered = 1,
                        display_nick = COALESCE(display_nick, name),
                        registered_at = COALESCE(registered_at, created_at)
                    WHERE (messages > 0 OR level > 1 OR xp > 0 OR coins > 0)
                `)
            } catch (_) {}
        }
    },
    {
        id: '016_user_extra',
        description: 'Coluna extra (JSON): guarda campos sem coluna própria. Sem isto, 37 campos gravados pelos comandos (cooldowns, banco, cofre, badges, títulos, montaria...) eram descartados silenciosamente no saveUser.',
        up: (db) => {
            try { db.exec('ALTER TABLE users ADD COLUMN extra TEXT;') } catch (_) {}
        }
    },
    {
        id: '015_user_skills',
        description: 'Coluna skills (árvore de habilidades). Sem ela o .arvorehabilidades dizia "SKILL DESBLOQUEADA" e o valor era descartado no saveUser.',
        up: (db) => {
            try { db.exec('ALTER TABLE users ADD COLUMN skills TEXT;') } catch (_) {}
        }
    }
]

function runMigrations(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `)

    const appliedRows = db.prepare('SELECT id FROM schema_migrations').all()
    const appliedIds = new Set(appliedRows.map(r => r.id))

    for (const migration of migrations) {
        if (!appliedIds.has(migration.id)) {
            logger.info(`🔄 Executando migration: ${migration.id} — ${migration.description}...`)
            try {
                migration.up(db)
                db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(migration.id)
                logger.info(`✅ Migration aplicada com sucesso: ${migration.id}`)
            } catch (err) {
                logger.error(`❌ Falha ao aplicar migration ${migration.id}:`, err)
                throw err
            }
        }
    }
}

module.exports = {
    runMigrations,
    migrations
}
