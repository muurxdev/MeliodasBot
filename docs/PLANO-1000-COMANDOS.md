# Plano de Projeção — 1000 Comandos

## ⚙️ Atualização (2026-09-03): modelo OPT-IN por módulo

A expansão até ~1000 agora segue a regra do dono: **cada comando novo nasce
DESLIGADO** e é liberado por MÓDULO (ou por comando) quando o dono quiser. Nada de
"soltar tudo de uma vez sem querer".

- **Camada opt-in** já implementada: `src/config/modules.js` (16 módulos/"farms") +
  `src/services/moduleStateService.js` + gate no dispatcher. Controle: `.modulo on/off
  <mod|all>` e `.cmdglobal on/off/auto <cmd>` (só dono). Ver memória `arquitetura-opt-in-modulos`.
- **Como expandir**: cada lote novo já cai no módulo certo via `resolveModuleKey(cmd)`
  (por categoria/subcategoria/nome). Ao subir um lote, ele fica OFF até o dono ligar
  o módulo correspondente. Assim dá pra "modelar tudo" e liberar aos poucos.
- **Estado atual real**: **494 comandos** (após a auditoria funcional Fases 0-4), não 429.
  0 erros de carga, 0 aliases mortos. As tabelas abaixo (429) são a base histórica do
  OpenCode; a projeção de temas/lacunas continua válida como guia de conteúdo.
- **Pré-requisito antes de codar os novos**: aprovação do dono por módulo/lote.

## Estado Atual

| Categoria | Comandos | Aliases | Subcategorias ativas |
|-----------|----------|---------|---------------------|
| `admin` | 60 | ~180 | Moderação, Segurança, Grupo, Wallpapers |
| `dev` | 61 | ~150 | Dev Hub, Criptografia, Ferramentas |
| `economy` | 48 | ~120 | Economia, Banco, Bolsa, Cassino, Loterias |
| `fun` | 41 | ~100 | Diversão, Jogos, Tabuleiro, Interação |
| `general` | 43 | ~130 | Pesquisa, IA, Utilitários, Informações |
| `media` | 23 | ~80 | Downloads, Mídias, Filtros |
| `owner` | 36 | ~90 | Donos, VPS, Aluguel |
| `profile` | 8 | ~20 | Perfil, Rank |
| `rpg` | 109 | ~350 | Classes, Caça, Masmorras, Guildas, Relíquias |
| **TOTAL** | **429** | **~1220** | |

## Política de Nomes e Aliases

### Regras (manter sem colisão)
1. Nome canônico: `lowercase`, sem acentos, sem espaços, máximo 25 chars
2. Alias: variações naturais em PT-BR (ex: `cassino`, `roleta`, `caçar`, `caça`)
3. Prefixo de categoria em aliases longos: `rpg-classe`, `eco-banco` (evita colisão)
4. Nenhum alias pode colidir com nome primário de OUTRO comando
5. Comandos de UX (menu, help, ping) mantêm aliases curtíssimos

### Padrão de exportação (já definido no CLAUDE.md)
```js
module.exports = {
  name: 'nome',
  aliases: ['alias1', 'alias2'],
  category: 'pasta',
  subcategory: '🏷️ SUBCATEGORIA',
  description: '...',
  cooldownMs: 2000,
  execute: async (ctx) => {}
}
```

## Lacunas Identificadas + Novos Comandos Propostos

### 1. `economy` (48 → ~130) — +82 comandos

**Subcategoria: 💰 Economia Pessoal (já existe: banco, cofre, investir)**
- `rendafixa` — Rendimento automático do saldo (juros compostos)
- `emprestimo` — Solicitar empréstimo ao "banco" do bot (com juros)
- `divida` — Ver/pagar dívida pendente
- `conta` — Criar "conta poupança" com taxa diferente
- `orcamento` — Definir limite de gasto semanal
- `metas` — Definir meta de coins (ex: "quero 10k")
- `historico` — Histórico de transações do usuário
- `extratodetalhado` — (corrigir: puxar do transactionRepository)

**Subcategoria: 🎰 Cassino & Loterias (já existe: roleta, cassino, blackjack)**
- `crash` — Jogo crash (multiplicador crescente, cashout antes de explodir)
- `mines` — Campo minado com aposta
- `plinko` — Plinko com recompensas variáveis
- `slots` — Caça-níquel clássico (3 rolos)
- `loteria` — Loteria do bot (comprar número, sorteio diário)
- `megapremio` — Mega-sena do bot
- `rifar` — Criar rifa com tickets
- `poedeira` — Galinha poedeira (acumula coins por tempo)

**Subcategoria: 🏪 Comércio & Mercado**
- `loja` — Loja de itens (já existe, melhorar)
- `leilao` — Criar leilão de itens entre jogadores
- `mercado` — Bolsa de valores do bot (preços flutuam)
- `acoes` — Comprar/vender "ações" fictícias
- `imovel` — Comprar/vender imóveis virtuais
- `carro` — Garage de veículos virtuais
- `empresa` — Criar/gerenciar empresa virtual
- `funcionario` — Contratar funcionários para empresa
- `salario` — Sistema de salário diário por cargo

**Subcategoria: 🎁 Presentes & Social**
- `presentear` — Enviar gift card de coins
- `caixasurpresa` — Abrir caixa com item aleatório
- `ticket` — Comprar ticket de sorteio
- `cupom` — Gerar/resgatar cupom de desconto
- `referir` — Sistema de referral (bônus por convidar)
- `recompensadiaria` — Login diário com recompensas crescentes
- `streak` — Sequência de dias consecutivos

### 2. `rpg` (109 → ~200) — +91 comandos

**Subcategoria: ⚔️ Combates & Batalhas**
- `duelosolo` — Duelo 1v1 com matchmaking
- `arena` — Arena automática (já existe, melhorar)
- `raidboss` — Boss comunitário (todos atacam juntos)
- `gvg` — Guild vs Guild (batalha entre guildas)
- `torneio` — Torneio eliminatório
- `desafio` — Desafiar jogador específico
- `recompensasdiarias` — Daily quest RPG

**Subcategoria: 🧙 Classes & Progressão**
- `classeshop` — Loja de classes (já existe)
- `skilltree` — Árvore de habilidades por classe
- `habilidade` — Usar habilidade especial em batalha
- `buff` — Aplicar buff temporário
- `debuff` — Aplicar debuff em oponente
- `evoluclasse` — Evolver classe para tier superior
- `prestigio` — Sistema de prestígio (reset com bônus)
- `title` — Títulos desbloqueáveis

**Subcategoria: 🏹 Caça & Masmorras**
- `masmorra` — Masmorras com salas (já existe, expandir)
- `boss` — Bosses世界 (já existe, adicionar mais)
- `bioma` — Explorar biomas diferentes
- `pesadelo` — Modo hard (inimigos mais fortes)
- `dungeon` — Masmorra infinita progressiva
- `loot` — Sistema de loot melhorado
- `craft` — Crafting de armas/armaduras
- `forjar` — Forjar itens raros
- `encantar` — Encantar itens com magia
- `grimorio` — Livro de magias aprendidas

**Subcategoria: 🐾 Pets & Companheiros**
- `pet` — Sistema de pets (já existe)
- `evoluirpet` — Evolver pet
- `petshop` — Loja de pets
- `petbatalha` — Batalha de pets
- `mount` — Montar (transporte com bônus)
- `companion` — Companion especial (drop raro)

**Subcategoria: 🏰 Guildas & Social**
- `guilda` — Sistema de guildas (já existe)
- `guerra` — Guerra entre guildas
- `construir` — Construir estrutura na guilda
- `recurso` — Gerenciar recursos da guilda
- `recrutamento` — Recrutar membros
- `rankguilda` — Ranking de guildas
- `eventoguilda` — Evento especial da guilda

**Subcategoria: 👑 Relíquias & Endgame**
- `reliquia` — Relíquias lendárias (já existe)
- `mandamento` — Mandamentos divinos
- `arcanjo` — Sistema de Arcanjos
- `runas` — Runas de upgrade
- `tesouro` — Caças ao tesouro
- `lostvayne` — Arma lendária especial
- `ascensao` — Ascensão divina (tier máximo)

### 3. `fun` (41 → ~100) — +59 comandos

**Subcategoria: 🎮 Jogos Interativos**
- `quiz` — Quiz de conhecimento geral (já existe, melhorar)
- `quizanime` — Quiz de anime (já existe)
- `forca` — Jogo da forca (já existe)
- `velha` — Jogo da velha (já existe, melhorar IA)
- `xadrez` — Xadrez (já existe, IA melhorada)
- `damas` — Damas (já existe)
- `batalhanaval` — Batalha naval
- `termo` — Wordle em PT-BR
- `semantico` — Jogo de palavras semânticas
- `cacaPalavras` — Caça-palavras 5x5
- `sudoku` — Sudoku numérico
- `seteErros` — Jogo dos 7 erros (imagem)
- `memoria` — Jogo da memória (implementar de verdade)
- `genius` — Genius das cores (implementar de verdade)
- `adivinheonumero` — Adivinhar número (já corrigido)
- `paquera` — Jogo de paquera aleatória
- `amigosecreto` — Amigo secreto no grupo
- `dart` — Jogo de dardos
- `bola` — Bolinha saltitante

**Subcategoria: 💖 Interação & Social**
- `ship` — Shippar dois usuários (já existe)
- `beijotapamatar` — Beijo tapa (já existe)
- `dancar` — Dançar (já existe)
- `abracar` — Abraçar
- `cumprimentar` — Cumprimentar
- `desafiar` — Desafiar para duelo de frases
- `cantar` — Cantar música aleatória
- `dormir` — Dormir (recupera HP)
- `acordar` — Acordar
- `comer` — Comer (recupera stamina)
- `viajar` — Viajar para lugar aleatório
- `acampar` — Acampar (gera loot)
- `pescar` — Pescar (já existe na economia, duplicar para RPG)
- `cozinhar` — Cozinhar peixe/ingrediente
- `plantar` — Plantar semente (haverá colheita)
- `colher` — Colher planta
- `construir` — Construir estrutura simples

**Subcategoria: 😂 Diversão & Memes**
- `meme` — Gerar meme (já existe)
- `frase` — Frase aleatória
- `piada` — Piada aleatória
- `curiosidade` — Curiosidade aleatória
- `definicao` — Definir palavra inventada
- `sinonimo` — Sinônimo de palavra
- `antonimo` — Antônimo de palavra
- `rime` — Rimar palavra
- `haiku` — Gerar haiku aleatório
- `poema` — Gerar poema curto
- `adivinha` — Adivinhação genérica

### 4. `general` (43 → ~90) — +47 comandos

**Subcategoria: 🔍 Pesquisa & Info**
- `google` — Pesquisa Google (já existe)
- `wiki` — Wikipedia (já existe)
- `clima` — Clima (já existe)
- `cep` — Consulta CEP (já existe)
- `ddd` — Info DDD (já existe)
- `tabelafipe` — Tabela FIPE (já existe)
- `signo` — Signo do zodíaco
- `calculoidade` — Calcular idade
- `moeda` — Conversor de moedas
- `distancia` — Calcular distância entre cidades
- `fusohorario` — Conversor de fuso horário
- `feriado` — Próximo feriado
- `countdown` — Countdown para data
- `aniversario` — Próximo aniversário do grupo

**Subcategoria: 🌐 Utilitários**
- `qrcode` — Gerar QR Code (já existe)
- `encurtar` — Encurtar URL (já existe)
- `previsao` — Previsão do tempo
- `noticias` — Últimas notícias
- `cotacao` — Câmbio em tempo real
- `cripto` — Preço de cripto
- `bolsa` — Bolsa de valores
- `podcast` — Buscar podcast
- `receita` — Receita de culinária
- `lembrete` — Criar lembrete
- `alarme` — Definir alarme
- `timer` — Timer regressivo
- `cronograma` — Cronograma do dia

**Subcategoria: 📐 Conversores & Calculadoras**
- `calc` — Calculadora (já existe)
- `base` — Converter bases (bin, oct, hex)
- `temp` — Converter temperaturas
- `peso` — Converter pesos
- `tamanho` — Converter tamanhos
- `velocidade` — Converter velocidades
- `area` — Calcular área
- `volume` — Calcular volume
- `imc` — Calculadora de IMC
- `tmb` — Taxa metabólica basal
- `calorias` — Contador de calorias

### 5. `media` (23 → ~60) — +37 comandos

**Subcategoria: 🎨 Filtros & Efeitos**
- `fig` — Figurinha (já existe)
- `toimg` — Sticker para imagem (já existe)
- `gif` — Gerar GIF (já existe)
- `blur` — Efeito blur (já existe)
- `pixelar` — Efeito pixel (já existe)
- `sepia` — Efeito sépia (já existe)
- `nobg` — Remover fundo (já existe)
- `ocr` — Extrair texto de imagem (já existe)
- `circle` — Crop circular (já existe)
- `wanted` — Efeito wanted (já existe)
- `wasted` — Efeito wasted (já existe)
- `triggered` — Efeito triggered (já existe)
- `invert` — Inverter cores (já existe)
- `mirror` — Espelhar imagem
- `rotate` — Rotacionar imagem
- `crop` — Cortar imagem
- `resize` — Redimensionar
- `watermark` — Adicionar marca d'água
- `frame` — Adicionar moldura
- `filter` — Filtros Instagram (vintage, retro, etc)
- `enhance` — Melhorar qualidade (upscaler)

**Subcategoria: 📥 Downloads**
- `media` — Download universal (já existe)
- `play` — Play/pesquisa (já existe)
- `spotify` — Spotify (já existe)
- `tiktok` — TikTok (já existe)
- `insta` — Instagram (já existe)
- `twitter` — Twitter/X (já existe)
- `kwai` — Kwai (já existe)
- `pinterest` — Pinterest (já existe)
- `reddit` — Reddit (já existe)
- `soundcloud` — SoundCloud (já existe)
- `facebook` — Facebook video
- `twitch` — Twitch clip
- `vimeo` — Vimeo
- `dailymotion` — Dailymotion
- `bilibili` — Bilibili
- `xvideos` — (成人) — pular, não apropriado
- `soundcloud2` — (skip)

**Subcategoria: 🎵 Áudio**
- `tts` — Text to speech (já existe)
- `transcrever` — Transcrever áudio (já existe)
- `audioviz` — Visualizador de áudio ( waveform animado)
- `equalizer` — Equalizador visual
- `pitch` — Alterar pitch
- `speed` — Alterar velocidade
- `loop` — Loop de áudio
- `mix` — Mixar dois áudios
- `intro` — Gerar intro musical
- `jingle` — Gerar jingle curto

### 6. `admin` (60 → ~100) — +40 comandos

**Subcategoria: 🛡️ Moderação**
- `warn` — Warn (já existe)
- `ban` — Banir (já existe)
- `kick` — Expulsar (já existe)
- `mute` — Mutar (já existe)
- `unmute` — Desmutar (já existe)
- `warnings` — Ver warns (já existe)
- `setwarnlimit` — Limite de warns (já existe)
- `purge` — Limpar mensagens (implementar de verdade)
- `slowmode` — Slow mode (já existe)
- `antilink` — Anti-link (já existe)
- `antispam` — Anti-spam (já existe)
- `antitrava` — Anti-trava (já existe)
- `antifake` — Anti-fake (já existe)
- `antidelete` — Anti-delete (já existe)
- `blacklistword` — Blacklist de palavras (implementar)
- `flood` — Anti-flood (cooldown por mensagem)
- `capslock` — Anti-capslock
- `profanity` — Filtro de palavrões
- `linkfilter` — Filtro de links específicos
- `mediafilter` — Filtrar tipos de mídia
- `timeban` — Ban temporário (auto-unban)
- `shadowban` — Shadow ban (usuário não vê que está banido)
- `restrict` — Restringir a enviar msgs (não é mute)
- `approval` — Aprovação de mensagens (moderação)

**Subcategoria: ⚙️ Configuração de Grupo**
- `welcome` — Mensagem de boas-vindas (já existe)
- `leave` — Mensagem de saída (já existe)
- `setdesc` — Descrição do grupo (já existe)
- `setnomegrupo` — Nome do grupo (já existe)
- `setfotogrupo` — Foto do grupo (já existe)
- `setprefix` — Prefixo do grupo (já existe)
- `setrules` — Regras do grupo
- `announcements` — Anúncios fixados
- `poll` — Enquete/votação (implementar de verdade)
- `event` — Criar evento no grupo
- `reminder` — Lembrete para o grupo
- `schedule` — Agendar mensagem (implementar de verdade)
- `backup` — Backup das config do grupo
- `restore` — Restaurar config do grupo
- `template` — Template de grupo (copiar config)

### 7. `owner` (36 → ~55) — +19 comandos

**Subcategoria: 👑 Gestão do Bot**
- `setdono` — Definir dono (já existe)
- `deldono` — Remover dono (já existe)
- `setbotname` — Nome do bot (já existe)
- `setprefix` — Prefixo global (já existe)
- `shutdown` — Desligar (já existe)
- `backup` — Backup (já existe)
- `restore` — Restaurar (já existe)
- `metrics` — Métricas (já existe)
- `doctor` — Diagnóstico (já existe)
- `autofix` — Auto-correção (já existe)
- `broadcast` — Broadcast (já existe)
- `logs` — Ver logs
- `debug` — Modo debug
- `reload` — Reload de comandos
- `update` — Atualizar bot (git pull)
- `rollback` — Reverter última atualização
- `env` — Ver/editar env vars
- `perf` — Performance do bot
- `memory` — Uso de memória
- `connections` — Conexões ativas

### 8. `profile` (8 → ~30) — +22 comandos

**Subcategoria: 📊 Status & Rankings**
- `perfil` — Perfil do usuário (já existe)
- `rank` — Ranking XP (já existe)
- `rankglobal` — Ranking global (já existe)
- `rankcoins` — Ranking coins (já existe)
- `ranksemana` — Ranking semanal (já existe)
- `xp` — Ver XP (já existe)
- `dossie` — Dossiê completo (já existe)
- `stats` — Estatísticas (já existe)
- `conquistas` — Conquistas desbloqueadas
- `badges` — Badges/coletáveis
- `trofeu` — Troféus especiais
- `levelup` — Ver próximo level
- `progress` — Barra de progresso detalhada
- `historico` — Histórico de ações
- `compare` — Comparar com outro usuário
- `clan` — Info do clan/grupo
- `title` — Título equipado
- `skin` — Skin/aparência do personagem
- `equipamento` — Equipamento atual
- `-statsdetalhado` — Stats detalhados (ATK, DEF, etc)
- `evolucao` — Gráfico de evolução
- `medalha` — Medalhas conquistadas

### 9. `dev` (61 → ~80) — +19 comandos

**Subcategoria: 🛠️ Ferramentas Dev**
- `json` — JSON formatter (já existe)
- `hash` — Hash generator (já existe)
- `regex` — Regex tester (já existe)
- `timestamp` — Timestamp converter (já existe)
- `color` — Color picker (já existe)
- `colorpalette` — Palette generator (já existe)
- `cron` — Cron expression parser (já existe)
- `markdown` — Markdown preview
- `htmlpreview` — HTML preview
- `diff` — Text diff
- `encrypt` — Encryption tool
- `decrypt` — Decryption tool
- `uuidgen` — UUID generator
- `nanoid` — Nano ID generator
- `lorem` — Lorem ipsum generator (já existe)
- `csv` — CSV parser
- `yaml` — YAML parser
- `toml` — TOML parser
- `envparse` — .env parser/validator

## Resumo por Fase

### Fase 1 — Correções Críticas ✅ (feito)
- 429 comandos auditados, bugs críticos corrigidos
- mentionedJid adicionado ao context
- media.js, xadrez.js, reencarnar.js, adivinheonumero.js corrigidos
- Comandos stub marcados como "em desenvolvimento"
- Cooldowns de economia implementados

### Fase 2 — Expansão H1 (~600 comandos)
Prioridade: comandos que geram engajamento e são simples de implementar.

**Lote 1 — Economia expandida** (+40 comandos)
- crash, mines, plinko, slots (jogos de aposta)
- rendafixa, emprestimo, divida, conta, orcamento, metas
- historico, extratodetalhado (corrigir)
- leilao, mercado, acoes, imovel, carro, empresa
- caixasurpresa, ticket, cupom, referir, streak

**Lote 2 — Fun expandido** (+30 comandos)
- batalhanaval, termo, semantico, cacaPalavras, sudoku
- abracar, cumprimentar, cantar, dormir, acordar, comer, viajar
- frase, piada, curiosidade, haiku, poema

**Lote 3 — General expandido** (+25 comandos)
- signo, calculoidade, moeda, distancia, fusohorario, feriado
- countdown, noticias, lembrete, alarme, timer
- base, temp, peso, tamanho, velocidade, area, volume, imc

**Lote 4 — Media expandido** (+20 comandos)
- facebook, twitch, vimeo, dailymotion, bilibili
- mirror, rotate, crop, resize, watermark, frame, filter, enhance
- audioviz, equalizer, pitch, speed, loop, mix

### Fase 3 — Expansão H2 (~850 comandos)
Prioridade: RPG profundo e admin avançado.

**Lote 5 — RPG expandido** (+50 comandos)
- duelosolo, raidboss, gvg, torneio, desafio
- skilltree, habilidade, buff, debuff, evoluclasse, prestigio
- pesadelo, dungeon, loot, craft, forjar, encantar
- petshop, petbatalha, mount, companion
- guerra, construir, recurso, recrutamento, rankguilda
- mandamento, arcanjo, runas, tesouro, ascensao

**Lote 6 — Admin expandido** (+30 comandos)
- flood, capslock, profanity, linkfilter, mediafilter
- timeban, shadowban, restrict, approval
- setrules, announcements, event, reminder, schedule
- template, backupgrupo

### Fase 4 — Expansão H3 (~1000 comandos)
Prioridade: features sociais, profiling, e dev tools.

**Lote 7 — Profile expandido** (+20 comandos)
- conquistas, badges, trofeu, levelup, progress
- historico, compare, clan, title, skin
- equipamento, statsdetalhado, evolucao, medalha

**Lote 8 — Owner + Dev** (+20 comandos)
- logs, debug, reload, update, rollback
- env, perf, memory, connections
- markdown, htmlpreview, diff, encrypt, decrypt
- uuidgen, csv, yaml, toml, envparse

**Lote 9 — Fun + Misc** (+30 comandos)
- seteErros, paquera, amigosecreto, dart, bola
- desafiar, plantar, colher, construir, acampar
- sinônimo, antônimo, rime, definicao
- mais interações sociais

## Escala do Menu

Com ~1000 comandos, o menu gerado terá:
- 9 categorias × ~8-15 subcategorias cada
- ~80-120 subcategorias no total
- Cada subcategoria: 5-15 comandos
- Menu completo: ~15-20 cards (paginado por categoria)
- Comando `.menu` lista categorias; `.menu <cat>` expande

O sistema de menu **já suporta** isso — é gerado dinamicamente do registro de comandos via `dispatcher.getCommands()` + `buildMenu()`. Comandos novos aparecem automaticamente se tiverem `category` e `subcategory`.

## Faseamento de Implementação

| Fase | Comandos | Prazo estimado | Dependências |
|------|----------|----------------|--------------|
| Fase 1 | Correções críticas | ✅ Feito | Nenhuma |
| Fase 2a | Economy lote 1 | 2-3 dias |transactionRepository para histórico |
| Fase 2b | Fun lote 2 | 2-3 dias | Nenhuma |
| Fase 2c | General lote 3 | 1-2 dias | APIs externas (clima, moeda) |
| Fase 2d | Media lote 4 | 1-2 dias | Nenhuma |
| Fase 3a | RPG lote 5 | 3-4 dias | Balanceamento de stats |
| Fase 3b | Admin lote 6 | 2-3 dias | Moderação avançada |
| Fase 4a | Profile lote 7 | 2-3 dias | Sistema de conquistas |
| Fase 4b | Owner+Dev lote 8 | 1-2 dias | Nenhuma |
| Fase 4c | Fun+Misc lote 9 | 2-3 dias | Nenhuma |
| **Total** | **~571 novos** | **~20-25 dias** | |

## Notas de Implementação

1. **Cada comando deve**: exportar `name`, `execute`, `category`, `subcategory`, `description`
2. **Aliases**: 2-4 por comando, sem colisão (verificar com `commandValidator`)
3. **Cooldown**: padrão 2000ms; jogos 3000-5000ms; admin/owner 1000ms
4. **Persistência**: sempre usar `saveUser`/`saveXpData` antes de mensagem de sucesso
5. **Testes**: rodar `npm test` e `commandValidator` após cada lote
6. **Deploy**: docker compose up -d --build após cada fase aprovada
