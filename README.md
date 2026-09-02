# 🤖 Daiki (v2.0.0 — Enterprise Modular Edition)

> Bot profissional de WhatsApp para grupos de desenvolvedores, integrando sistema de RPG completo, economia persistente em SQLite, central de download de mídia multiplataforma com barra de progresso ao vivo, utilitários ativos de engenharia de software (Dev Hub), moderação automatizada, hierarquia de permissões em 5 níveis, observabilidade e agendador persistente de ciclo de vida.

---

## 🏛️ Arquitetura do Sistema (15 Fases de Engenharia)

```text
Daiki/
├── backups/               # Snapshots atômicos a quente do SQLite (VACUUM INTO)
├── data/                  # Banco SQLite em WAL mode (database.sqlite)
├── docs/                  # Documentações técnicas e relatórios das 15 fases
├── scripts/               # Deploy automatizado, CLI de testes, Seeder e Healthcheck
├── src/
│   ├── commands/          # 114 comandos modulares (+ 246 aliases)
│   │   ├── admin/         # Moderação (.antilink, .kick, .warn, .warnings, .clear)
│   │   ├── dev/           # Dev Hub (.json, .hash, .b64, .jwt, .uuid, .regex, .timestamp, .dns, .headers)
│   │   ├── economy/       # Economia e apostas (.cassino, .buy, .pay, .shop, .vender)
│   │   ├── general/       # Utilitários (.help, .menu, .ping, .calc, .health, .info, .dono)
│   │   ├── media/         # Media Engine (.play, .media, .youtube, .insta, .tiktok, .twitter, .reddit, .queue, .cancel, .fig)
│   │   ├── owner/         # Owner Core (.up, .down, .bandm, .trust, .metrics, .backup, .backuplist, .sysinfo, .botclose)
│   │   ├── profile/       # Perfil e rankings (.xp, .perfil, .rank, .topcoins, .daily, .rep)
│   │   └── rpg/           # RPG (.hunt, .boss, .arena, .duelo, .classe, .pet, .guilda, .curar)
│   ├── config/            # Resolução de paths e variáveis de ambiente (.env)
│   ├── core/              # Conexão Baileys v7, Logger estruturado, Reconnect e Shutdown gracioso
│   ├── database/          # SQLite nativo (node:sqlite), Migrations versionadas e Repositórios
│   ├── dev/               # Mock Factory do Baileys e simulação de contextos
│   ├── handlers/          # Command Dispatcher com Rate Limiter multi-janela e RBAC
│   ├── services/          # Motores centrais (Media, Queue, Progress, Scheduler, Telemetry, Backup, Security)
│   └── utils/             # Validadores SSRF, formatadores e constantes
├── tests/                 # 12 Suítes de testes automatizados (108 testes unitários e E2E)
├── Dockerfile             # Imagem conteinerizada segura (Node 22, FFmpeg, yt-dlp, Non-Root)
├── docker-compose.yml     # Orquestração Docker com volumes persistentes e limites de 512MB RAM
└── ecosystem.config.js    # Configuração de processos do PM2 para VPS Hostinger
```

---

## ⚡ Início Rápido

### Pré-requisitos
- **Node.js**: v20+ ou v22+ LTS
- **FFmpeg & yt-dlp**: Para processamento de áudio, vídeo e figurinhas

### Instalação e Testes
```bash
# 1. Instalar dependências
npm install

# 2. Executar suíte completa de testes automatizados (108 testes, 100% de sucesso)
npm test

# 3. Testar comandos no terminal sem WhatsApp (Modo Simulação)
npm run cli
```

---

## 🚀 Como Iniciar em Produção

### 1. Iniciar Direto (Node.js)
```bash
npm start
```

### 2. Iniciar em Servidor Linux VPS (PM2)
```bash
# Executar script automatizado de deploy
./scripts/deploy.sh

# Ou manualmente:
pm2 start ecosystem.config.js
pm2 logs meliodas-bot-xp
```

### 3. Iniciar com Docker Compose
```bash
docker compose up -d --build
docker compose logs -f meliodas-bot
```

---

## 🎮 Principais Recursos e Comandos

### 📥 Media Engine Multiplataforma & Live Progress
- `.play [música]` — Pesquisa e baixa áudio de alta fidelidade
- `.media [link]` — Download automático do YouTube, Instagram, TikTok, Twitter/X, Reddit e Pinterest
- `.queue` — Exibe a fila priorizada de downloads
- `.cancel [jobId]` — Cancela download ativo
- `.fig` (com imagem ou vídeo) — Cria figurinhas animadas ou estáticas com metadados EXIF

### 👨‍💻 Dev Hub de Engenharia de Software
- `.json format [payload]` — Formata e valida JSON RFC 8259
- `.hash [algo] [texto]` — Hashes criptográficos (SHA256, MD5, SHA512)
- `.b64 [encode|decode] [texto]` — Codificação e decodificação Base64
- `.jwt [token]` — Decodificador seguro de cabeçalho e payload de JWT
- `.uuid` — Gerador criptográfico de UUID v4
- `.regex [pattern] [texto]` — Testador de expressões regulares com grupos
- `.timestamp [epoch]` — Conversor UNIX epoch para BRT, UTC e ISO 8601
- `.dns [domain] [type]` — Consulta de registros DNS (A, AAAA, MX, TXT)
- `.headers [url]` — Inspetor de cabeçalhos HTTP com proteção SSRF

### ⏰ Bot Lifecycle Scheduler (Persistente no SQLite)
- `.botclose [45m|2h|indef]` — Fecha o bot temporariamente ou indefinidamente
- `.botopen` — Reabre o bot imediatamente
- `.botschedule` — Consulta a agenda ativa de fechamentos

### 👑 Owner & Hierarquia em 5 Níveis (RBAC)
- Hierarquia: `OWNER (5) > BOT_ADMIN (4) > GROUP_ADMIN (3) > TRUSTED (2) > USER (1)`
- `.up @user [CARGO]` — Promove usuário
- `.down @user` — Rebaixa cargo
- `.bandm @user` / `.banstatus @user` — Aplica restrições seletivas
- `.trust @user` — Adiciona usuário à lista de confiança (limite estendido de rate limit)
- `.backup` / `.backuplist` / `.backuprestore` — Gestão de hot snapshots SQLite
- `.metrics` / `.health` — Telemetria de latência, throughput e integridade da VPS

---

## 🧪 Bateria de Testes Automatizados (108/108 Aprovados — 100% Sucesso)

1. `tests/database.test.js` — SQLite, Migrations e Repositórios (10 testes)
2. `tests/rpg.test.js` — Combate, Conquistas e Level Up (9 testes)
3. `tests/media.test.js` — Media Engine, Provedores e Prioritized Queue (10 testes)
4. `tests/progress-engine.test.js` — Máquina de Estados e Dashboards (4 testes)
5. `tests/security.test.js` — Hierarquia RBAC, Multi-Window RateLimit, Auto-Blacklist (11 testes)
6. `tests/scheduler.test.js` — Agendamentos Persistentes e Recovery (9 testes)
7. `tests/dev-tools.test.js` — Utilitários Dev Hub e Seeder (12 testes)
8. `tests/telemetry.test.js` — Latência, Throughput e Healthcheck (4 testes)
9. `tests/backup.test.js` — Snapshots a quente, Rotação e Restauração (6 testes)
10. `tests/deploy.test.js` — Dockerfile, Compose, PM2 e Healthcheck (7 testes)
11. `tests/e2e.test.js` — 8 Fluxos integrados de ponta a ponta (8 testes)
12. `tests/core.test.js` — Dispatcher, Help dinâmico e utilitários (20 testes)

---

## 📄 Licença
MIT © Daiki

## 👨‍💻 Desenvolvedores

- **Daiki** — Dono do bot
