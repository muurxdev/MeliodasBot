# Daiki - WhatsApp Bot

Um bot de WhatsApp completo com sistemas de XP, economia, RPG, guildas e muito mais.

## 📋 Requisitos do Sistema

### Node.js
- **Versão requerida:** Node.js 18.0.0 ou superior
- **Verifique:** `node --version`

### Dependências NPM (Automáticas)
- `@whiskeysockets/baileys` - Conexão WhatsApp
- `mathjs` - Cálculos matemáticos
- `node-webpmux` - Criação de figurinhas
- `pino` - Logging

Instaladas automaticamente com `npm install`

### Ferramentas Externas (Obrigatórias)

#### 🎵 yt-dlp (Para comando .play)

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install python3-pip
pip install yt-dlp
```

**macOS:**
```bash
brew install yt-dlp
```

**Windows (Chocolatey):**
```bash
choco install yt-dlp
```

**Windows (Manual):**
Baixe em: https://github.com/yt-dlp/yt-dlp/releases

#### 🎬 FFmpeg (Para conversão de mídia)

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

**Windows (Manual):**
Baixe em: https://ffmpeg.org/download.html

### Verificar Instalação das Ferramentas

```bash
# Verificar yt-dlp
yt-dlp --version

# Verificar FFmpeg
ffmpeg -version
```

Se ambas mostram versão, está tudo certo! ✅

## 🚀 Instalação

### 1. Clonar ou baixar o repositório
```bash
cd Daiki
```

### 2. Instalar dependências Node.js
```bash
npm install
```

### 3. Configurar ambiente (Opcional)
```bash
cp .env.example .env
# Edite .env com suas configurações
```

### 4. Iniciar o bot
```bash
npm start
```

Na primeira execução:
1. O bot pedirá seu número de WhatsApp com DDI (ex: 5521999999999)
2. Um código de pareamento será gerado
3. Escaneie o código no seu WhatsApp

## 📁 Estrutura de Diretórios

```
Daiki/
├── indexx.js           # Arquivo principal do bot
├── package.json        # Configuração NPM
├── .env.example        # Exemplo de configuração
├── .gitignore          # Arquivos excluídos do git
├── data/               # Dados do bot (criado automaticamente)
│   ├── xp.json        # Dados de XP e perfil
│   ├── boss.json      # Dados de bosses ativos
│   ├── missoes.json   # Dados de missões
│   ├── warns.json     # Avisos de usuários
│   ├── guilds.json    # Dados de guildas
│   ├── crafts.json    # Equipamentos craftados
│   └── configs.json   # Configurações
├── sessao/            # Sessão WhatsApp (gitignored)
├── temp/              # Arquivos temporários
├── docs/              # Documentação do projeto
│   ├── AUDIT_REPORT.md
│   ├── SECURITY_AUDIT.md
│   ├── KNOWN_ISSUES.md
│   └── ...
└── node_modules/      # Dependências (gitignored)
```

## ⚙️ Configuração Avançada

### Variáveis de Ambiente (.env)

```bash
# Bot Configuration
BOT_PREFIX=.              # Prefixo dos comandos
BOT_OWNER_ID=YOUR_ID      # ID do dono do bot (WhatsApp)

# Logging
DEBUG=false               # Ativar logs detalhados
LOG_LEVEL=info           # error, warn, info, debug

# Security
RATE_LIMIT_ENABLED=true  # Limitar requisições
RATE_LIMIT_REQUESTS=10   # Requests por window
RATE_LIMIT_WINDOW=60000  # Janela em ms (1 minuto)
```

## 🎮 Comandos Principais

### 👤 Perfil
- `.dossie` - Ver seu perfil e telemetria completa
- `.xp` - Ver XP seu ou de alguém
- `.rank` - Top ranking global
- `.stats` - Estatísticas detalhadas

### 💰 Economia
- `.daily` - Resgatar prêmio diário
- `.shop` - Ver loja
- `.buy nome` - Comprar item
- `.coins` - Ver saldo de coins

### ⚔️ RPG
- `.arena` - Batalhas de arena
- `.batalhar` - Lutar em arena
- `.boss` - Sistema de bosses
- `.atk` - Atacar boss
- `.duelo` - Desafiar jogador

### 🏰 Sistemas
- `.missao` - Missões diárias
- `.guilda` - Guildas
- `.pet` - Sistema de pets
- `.craft` - Craftar equipamentos

### 🛡️ Admin
- `.kick @user` - Remover do grupo
- `.warn @user` - Avisar usuário
- `.antilink on/off` - Anti-link

## 🔒 Segurança

- ✅ Credenciais protegidas em `.gitignore`
- ✅ Sessão WhatsApp em pasta separada
- ✅ Sem hardcoded secrets
- ✅ Validação de input
- ✅ Error handling adequado

**NÃO COMPARTILHE:**
- Arquivo `.env`
- Pasta `sessao/`
- Conteúdo de `data/` com dados pessoais

## 🔧 Troubleshooting

### Bot não inicia
```bash
# Verifique se Node.js está instalado
node --version

# Verifique se as dependências estão instaladas
npm list

# Verifique syntax
node -c indexx.js
```

### Comando .play não funciona
```bash
# Verifique yt-dlp
yt-dlp --version

# Verifique FFmpeg
ffmpeg -version

# Se não estiverem, instale conforme acima
```

### Erro ao conectar WhatsApp
```bash
# Verifique a pasta sessao
ls sessao/

# Se houver problemas, delete e reconecte
rm -rf sessao/*
npm start
```

### Dados corrompidos
```bash
# Backup dos dados
cp data/xp.json data/xp.json.bak

# Verificar JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('data/xp.json')))"
```

## 📊 Monitoramento

### Logs
O bot gera logs estruturados com timestamp:

```
[INFO] 2026-08-30T15:30:45.123Z [DAILY] User 55219999999@lid claimed daily reward
[ERROR] 2026-08-30T15:31:12.456Z Erro ao salvar XP data: EACCES: permission denied
[WARN] 2026-08-30T15:32:00.789Z BOT_OWNER_ID não configurado em .env
```

### Performance
- Verifique memória: `free -h` (Linux) ou Task Manager (Windows)
- Verifique disco: `df -h` (Linux) ou `disk usage` (Windows)
- Verifique rede: Latência de conexão com WhatsApp

## 🐛 Reportar Problemas

Se encontrar bugs:
1. Verifique se está na versão mais recente
2. Consulte `docs/KNOWN_ISSUES.md`
3. Verifique logs para mensagens de erro
4. Teste com um novo backup de dados

## 📝 Licença

MIT - Veja LICENSE para detalhes

## 👨‍💻 Desenvolvedor

**Spectrum** - YouTube: @Spectrum_bots

---

**Última atualização:** 2026-08-30  
**Versão:** 2.0.0  
**Status:** Fase 1 - Estabilização (Completo)

