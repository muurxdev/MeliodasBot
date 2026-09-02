# KNOWN ISSUES & PENDING ARCHITECTURAL REFACTOR — MeliodasBotXP

**Data:** 2026-08-30  
**Status da Fase 1:** ESTABILIZADO (Todos os bugs críticos de execução e concorrência foram corrigidos) ✅  

---

## 1. PROBLEMAS CRÍTICOS RESOLVIDOS NA FASE 1

- ✅ **Race Conditions de Arquivos JSON:** Resolvido com `acquireLock` e `releaseLock` assíncronos.
- ✅ **Caminhos Relativos e Poluição da Raiz:** Resolvido com migração automática para `data/` e isolamento de arquivos transitórios em `temp/`.
- ✅ **Injeção de Argumentos no `.play`:** Resolvido com sanitização de query e parâmetros seguros.
- ✅ **Tratamento de Exceções em Comandos Críticos:** Todos os comandos de admin, economia e combate ganharam blocos `try/catch` e logs estruturados.
- ✅ **Código Morto e Casos Duplicados de Craft:** Dead code removido e `.craft` unificado.
- ✅ **Erro de Inicialização de Usuários:** `initializeUser` garante que campos não fiquem como `undefined`.

---

## 2. ITENS ARQUITETURAIS PLANEJADOS PARA AS PRÓXIMAS FASES

Estes itens não são bugs bloqueantes, mas melhorias de arquitetura organizadas nas fases seguintes:

### 🟡 FASE 2: Refatoração Estrutural (Modularização)
- Extrair comandos do arquivo monólito `indexx.js` (~5.800 linhas) para módulos separados em `src/commands/` (ex: `admin/`, `economy/`, `rpg/`, `media/`, `general/`).
- Criar dispatcher dinâmico de comandos e handlers de eventos limpos.

### 🟡 FASE 3: Persistência Robusta de Dados
- Migrar do armazenamento em arquivos JSON para banco de dados relacional (SQLite / PostgreSQL) com suporte a transações ACID e migrações versionadas.

### 🟡 FASE 4: Progress Engine & RPG Completo
- Refinar mecânicas avançadas de batalha, balanceamento de atributos, missões diárias/semanais e guildas.

### 🟡 FASE 5: Media Hub
- Gerenciamento robusto de downloaders e conversores multimídia com filas assíncronas de processamento.

### 🟡 FASE 6: Owner Core & Segurança
- Controle de acesso granular baseado em papéis (ACL), comandos restritos de dono e proteção contra flood/spam por comando.
