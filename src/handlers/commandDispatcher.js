const fs = require('fs')
const path = require('path')
const logger = require('../core/logger')
const env = require('../config/env')
const securityService = require('../services/securityService')
const botScheduler = require('../services/botScheduler')
const { resolveUserRole, canExecuteCommand, ROLES, ROLE_NAMES, permissionRepo } = require('../services/permissionService')
const telemetryService = require('../services/telemetryService')
const dataService = require('../services/dataService')
const userRepo = require('../database/repositories/userRepository')
const analyticsRepo = require('../database/repositories/analyticsRepository')
const { validateRegistry, formatReport } = require('./commandValidator')
const aliasOwners = require('../config/aliasOwners')
const { resolveCategoryKey } = require('../config/categories')
const { getBotName } = require('../config/botConfig')
const moduleState = require('../services/moduleStateService')
const { resolveModuleKey, BY_KEY: MODULE_BY_KEY } = require('../config/modules')

const commands = new Map()
const aliases = new Map()
const cooldowns = new Map()
let lastValidationReport = null

function loadCommands(commandsDir = path.join(__dirname, '..', 'commands')) {
    commands.clear()
    aliases.clear()

    if (!fs.existsSync(commandsDir)) {
        logger.warn(`Diretório de comandos não encontrado: ${commandsDir}`)
        return
    }

    // 1. Coleta todos os módulos (na ordem de varredura) antes de registrar,
    //    para permitir validação de colisões e política de resolução explícita.
    const entries = []
    function scanDir(dir) {
        const dirEntries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of dirEntries) {
            const fullPath = path.resolve(dir, entry.name)
            if (entry.isDirectory()) {
                scanDir(fullPath)
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                const relPath = path.relative(commandsDir, fullPath)
                try {
                    delete require.cache[require.resolve(fullPath)]
                    const cmd = require(fullPath)
                    entries.push({ file: relPath, cmd })
                } catch (err) {
                    logger.error(`Erro ao carregar comando ${relPath}:`, err)
                    entries.push({ file: relPath, cmd: null, loadError: err })
                }
            }
        }
    }
    scanDir(commandsDir)

    // 2. Valida o registro e reporta (sempre loga; só aborta em modo estrito).
    const report = validateRegistry(entries.filter(e => !e.loadError))
    lastValidationReport = report
    if (report.errors.length || report.warnings.length) {
        logger.warn(formatReport(report))
    }
    if (report.errors.length && process.env.STRICT_COMMANDS === '1') {
        throw new Error(`Registro de comandos inválido: ${report.errors.length} erro(s). Veja o relatório acima.`)
    }

    // 3. Registra aplicando a política:
    //    - nome: first-wins (o primeiro arquivo na ordem alfabética mantém o nome)
    //    - alias que colide com nome: descartado (nome sempre ganha na resolução)
    //    - alias em conflito: first-wins, salvo dono explícito em aliasOwners
    for (const { cmd, loadError } of entries) {
        if (loadError || !cmd || !cmd.name || typeof cmd.execute !== 'function') continue

        const cmdName = cmd.name.toLowerCase()
        if (!commands.has(cmdName)) {
            commands.set(cmdName, cmd)
        }
    }

    for (const { cmd, loadError } of entries) {
        if (loadError || !cmd || !cmd.name || typeof cmd.execute !== 'function') continue
        if (!Array.isArray(cmd.aliases)) continue

        for (const rawAlias of cmd.aliases) {
            const alias = String(rawAlias).toLowerCase()
            if (commands.has(alias)) continue                 // alias morto: nome ganha
            const owner = aliasOwners[alias]
            if (aliases.has(alias)) {
                if (owner && owner === cmd.name) aliases.set(alias, cmd)  // dono explícito vence
                continue                                       // senão: first-wins
            }
            if (owner && owner !== cmd.name && commands.has(owner)) {
                // Há dono explícito e não é este comando: reserva para o dono.
                continue
            }
            aliases.set(alias, cmd)
        }
    }

    logger.info(`✅ Total de comandos carregados: ${commands.size} (+ ${aliases.size} aliases)`)
}

function getValidationReport() {
    return lastValidationReport
}

async function dispatch(context) {
    const {
        commandName,
        sender,
        senderReal,
        from,
        isGroup,
        isAdmin,
        isBotAdmin,
        isOwner,
        reply,
        args,
        prefix = '.'
    } = context

    // Identidade canônica do usuário: em grupos com LID, o key.participant é um @lid;
    // senderReal é o JID real (@s.whatsapp.net) resolvido via signalRepository.lidMapping.
    const roleJid = senderReal || sender
    context.roleJid = roleJid

    if (context.text === undefined && Array.isArray(args)) {
        context.text = args.join(' ')
    }

    if (!commandName) return false

    // Se o usuário digitou uma URL diretamente após o prefixo (ex: .https://vt.tiktok.com/...)
    if (commandName.startsWith('http://') || commandName.startsWith('https://') || commandName.includes('tiktok.com') || commandName.includes('twitter.com') || commandName.includes('youtu')) {
        const mediaCmd = commands.get('media')
        if (mediaCmd) {
            context.text = `${commandName} ${context.text || ''}`.trim()
            return mediaCmd.execute(context)
        }
    }

    const cmdLower = commandName.toLowerCase()

    // 0. Reconhecimento automático de Categorias (ex: .rpg, .eco, .admin, .dono, .ia, .dev)
    //    Fonte única em config/categories.js — sem lista hardcoded divergente aqui.
    if (!commands.has(cmdLower) && !aliases.has(cmdLower)) {
        const catKey = (cmdLower === 'all' || cmdLower === 'completo' || cmdLower === 'total')
            ? 'all'
            : resolveCategoryKey(cmdLower)
        if (catKey) {
            const menuCmd = commands.get('menu')
            if (menuCmd) {
                context.args = [catKey]
                context.commandName = 'menu'
                return menuCmd.execute(context)
            }
        }
    }

    const cmd = commands.get(cmdLower) || aliases.get(cmdLower)
    if (!cmd) {
        // Resolve o cargo antes para filtrar sugestões pela permissão do usuário
        // (não expõe comandos de owner/admin a membros comuns).
        const suggestRole = resolveUserRole(roleJid, isAdmin, isOwner)
        const suggestions = findClosestCommands(cmdLower, 5, { userRole: suggestRole, isGroup, isBotAdmin })
        const cleanSender = sender.split('@')[0].split(':')[0]

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🤖 *CENTRAL DE AUXÍLIO & GUIA* 🤖  ║\n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `👋 Olá @${cleanSender}! O comando \`${prefix}${commandName}\` não foi reconhecido.\n\n`

        if (suggestions.length > 0) {
            doc += `╭━〔 🔍 COMANDOS CORRESPONDENTES 〕━⬣\n`
            suggestions.forEach((s) => {
                doc += `┃ ➤ \`${prefix}${s.name}\` — ${s.description || 'Comando do bot'}\n`
            })
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        }

        doc += `╭━〔 🧭 CATEGORIAS PRINCIPAIS 〕━⬣\n`
        doc += `┃ ⚔️ \`${prefix}rpg\` — Menu de RPG, Masmorras e Combates\n`
        doc += `┃ 💰 \`${prefix}eco\` — Menu de Economia, Banco e Cassino\n`
        doc += `┃ 📥 \`${prefix}media\` — Menu de Downloads e Músicas\n`
        doc += `┃ 🧠 \`${prefix}ia\` — Menu de Inteligência Artificial e Pesquisa\n`
        doc += `┃ 📜 \`${prefix}menu\` — Catálogo completo de todos os comandos\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `💡 _Dica: Digite o nome da categoria diretamente (ex: \`${prefix}rpg\`, \`${prefix}eco\`, \`${prefix}adm\`) para ver os comandos!_`

        await reply(doc.trim(), [sender])
        return true
    }

    // 1. Verificação de Blacklist Global
    if (securityService.isUserBanned(roleJid)) {
        await reply('🚫 *Acesso Negado:* Você foi banido de utilizar os comandos do bot.')
        return true
    }

    // 2. Resolução do Cargo na Hierarquia de 5 Níveis
    const userRole = resolveUserRole(roleJid, isAdmin, isOwner)
    context.userRole = userRole
    const isOwnerOrBotAdmin = userRole.level >= ROLES.BOT_ADMIN
    const isUserOwner = isOwner || userRole.level >= ROLES.OWNER

    // 3. Interceptação Universal de Ajuda/Dicas (-help, --help, -h, help, ajuda)
    const helpFlags = ['-help', '--help', '-h', 'help', 'ajuda', '-ajuda', '-dica', '-dicas']
    const hasHelpFlag = Array.isArray(args) && args.some(a => helpFlags.includes(a.toLowerCase()))
    if (hasHelpFlag) {
        const nonHelpArgs = args.filter(a => !helpFlags.includes(a.toLowerCase()))
        const targetQuery = nonHelpArgs.length > 0 ? nonHelpArgs.join(' ') : cmd.name
        const helpCmd = commands.get('help')
        if (helpCmd) {
            context.text = targetQuery
            return helpCmd.execute(context)
        }
    }

    // 3.1 Verificação de Comandos e Categorias Banidas Globalmente (.bancmd - Donos são imunes)
    const configs = dataService.getConfigsData()
    const globalBanned = configs['global']?.bannedCommands
    const immuneCommands = ['bancmd', 'unbancmd', 'dono', 'setdono', 'botopen', 'botclose', 'eval', 'shutdown', 'restart', 'menu', 'help']

    if (globalBanned && !isUserOwner && !immuneCommands.includes(cmd.name.toLowerCase())) {
        const cmdCategory = (cmd.category || '').toLowerCase()
        const bannedInfo = globalBanned['all'] || globalBanned[cmd.name.toLowerCase()] || (context.commandName && globalBanned[context.commandName.toLowerCase()]) || (cmdCategory && globalBanned[cmdCategory])
        if (bannedInfo) {
            let banMsg = `╔══════════════════════════════╗\n`
            banMsg += `║   🚫 *COMANDO DESATIVADO* 🚫   ║\n`
            banMsg += `╚══════════════════════════════╝\n\n`
            banMsg += `🔒 O comando \`.${cmd.name}\`${cmdCategory && globalBanned[cmdCategory] ? ` (Categoria ${cmdCategory.toUpperCase()})` : ''} foi suspenso globalmente pela administração.\n`
            banMsg += `📝 *Motivo:* ${bannedInfo.reason || 'Suspensão por tempo indeterminado'}\n`
            banMsg += `📅 *Suspenso em:* ${bannedInfo.date || 'Recentemente'}\n\n`
            banMsg += `💡 _Aguarde a reativação pela administração do bot._`
            await reply(banMsg.trim())
            return true
        }
    }

    // 3.1.5 Categoria desativada no grupo (.categoria off <cat>) — bloqueia toda a categoria
    const catKeyForToggle = (cmd.category || '').toLowerCase()
    if (isGroup && catKeyForToggle && !isAdmin && !isUserOwner) {
        const disabledCats = configs[from]?.disabledCategories || []
        const alwaysAllowed = ['menu', 'help', 'categoria', 'dono', 'ping']
        if (disabledCats.includes(catKeyForToggle) && !alwaysAllowed.includes(cmd.name.toLowerCase())) {
            let catDoc = `╔══════════════════════════════╗\n`
            catDoc += `║   🔒 *CATEGORIA DESATIVADA* 🔒   ║\n`
            catDoc += `╚══════════════════════════════╝\n\n`
            catDoc += `⚠️ A categoria *${catKeyForToggle.toUpperCase()}* está desativada neste grupo.\n`
            catDoc += `🚫 O comando \`.${cmd.name}\` não pode ser usado agora.\n\n`
            catDoc += `💡 _Para reativar, peça a um *Administrador* do grupo:_\n\`.categoria on ${catKeyForToggle}\``
            await reply(catDoc.trim())
            return true
        }
    }

    // 3.1.6 Opt-in de RPG (Fase B): quem desativou RPG no perfil é convidado a reativar
    if (catKeyForToggle === 'rpg' && context.user && context.user.registered && context.user.rpgEnabled === false) {
        await reply(`⚔️ *RPG desativado no seu perfil.*\n\n🎮 Para jogar, ative o modo RPG:\n\`${prefix}login rpg on\``)
        return true
    }

    // 3.2 Verificação de Modo Restrito no Grupo (.restringir adm - Apenas ADMs e Donos)
    if (isGroup && configs[from]?.restrictedToAdmins && !isAdmin && !isUserOwner) {
        const allowedInRestricted = ['menu', 'help', 'dossie', 'ping']
        if (!allowedInRestricted.includes(cmd.name.toLowerCase())) {
            let resDoc = `╔══════════════════════════════╗\n`
            resDoc += `║   🔒 *MODO RESTRITO ATIVO* 🔒   ║\n`
            resDoc += `╚══════════════════════════════╝\n\n`
            resDoc += `⚠️ Este grupo está com o *Modo Restrito a Administradores* ativado.\n\n`
            resDoc += `🛡️ *Apenas Administradores do grupo e Donos do bot podem executar comandos.*\n`
            resDoc += `💡 _Esta medida foi ativada pela administração para evitar flood e manter a organização do grupo._`
            await reply(resDoc.trim())
            return true
        }
    }

    // 4. Verificação de Comandos Exclusivos de Grupo (groupOnly)
    if (cmd.groupOnly && !isGroup) {
        await reply('❌ *Comando Inválido:* Este comando só pode ser utilizado em grupos.')
        return true
    }

    // 5. Verificação de Restrição de DM (.bandm individual)
    if (!isGroup && permissionRepo.isDmBlocked(roleJid) && !isUserOwner) {
        await reply('🔒 *Acesso Bloqueado:* Sua interação via mensagem privada (DM) com o bot foi suspensa pela administração.')
        return true
    }

    // 6. Verificação de Bloqueio Global de DM (.bandm on)
    if (!isGroup && configs['global']?.blockAllDMs && !isUserOwner) {
        await reply('🚫 *Privado Fechado:*\n\n🔒 O atendimento no privado do bot está temporariamente bloqueado pela administração.\n💡 *Dica:* Utilize os comandos nos grupos onde o bot está presente.')
        return true
    }

    // 7. Verificação de Modo Manutenção
    if (securityService.isMaintenanceActive() && userRole.level < ROLES.OWNER) {
        await reply('🔧 *MODO MANUTENÇÃO:* O bot está passando por melhorias técnicas. Apenas o Dono pode executar comandos no momento.')
        return true
    }

    // 8. Validação Centralizada de Permissões (5-Tier Role System)
    const permCheck = canExecuteCommand(userRole, cmd, { isGroup, isBotAdmin })
    if (!permCheck.allowed) {
        await reply(permCheck.reason)
        return true
    }

    // 8.1 Camada GLOBAL opt-in (tudo OFF por padrão) — só o DONO libera (por módulo
    // ou por comando). Roda DEPOIS de permissão/escopo: erros de "não é admin" /
    // "só em grupo" têm prioridade; a mensagem de OFF só aparece a quem poderia usar.
    if (!isUserOwner) {
        // Escopo do ambiente: no grupo vale o estado DAQUELE grupo; no PV, o do PV.
        const optInScope = moduleState.scopeOf(from, isGroup)
        const optInAllowed = ['menu', 'help', 'dono', 'ping', 'modulo', 'cmdglobal',
            'login', 'registrar', 'cadastrar', 'registro', 'perfilconfig', 'entrarbot', 'comandos']
        if (!optInAllowed.includes(cmd.name.toLowerCase()) && !moduleState.isCommandEnabled(cmd, optInScope)) {
            const mk = resolveModuleKey(cmd)
            const mLabel = (MODULE_BY_KEY[mk] && MODULE_BY_KEY[mk].label) || mk
            let offDoc = `╔══════════════════════════════╗\n`
            offDoc += `║   🔒 *COMANDO INDISPONÍVEL* 🔒   ║\n`
            offDoc += `╚══════════════════════════════╝\n\n`
            offDoc += `⏸️ O comando \`.${cmd.name}\` pertence ao módulo *${mLabel}*, ainda não liberado pela administração.\n`
            offDoc += `💡 _Um Dono do bot pode ativar com:_ \`${prefix}modulo on ${mk}\``
            await reply(offDoc.trim())
            return true
        }
    }

    // 9. Verificação do Modo Aluguel em Grupos
    if (isGroup && userRole.level < ROLES.OWNER) {
        const rentalService = require('../services/rentalService')
        if (rentalService.isRentalModeEnabled(from)) {
            const bypassCmds = ['aluguel', 'rent', 'vitalicio', 'dono', 'donos', 'ping']
            if (!bypassCmds.includes(cmd.name.toLowerCase())) {
                const rental = rentalService.getRentalInfo(from)
                if (!rental || rental.isExpired) {
                    let doc = `╔══════════════════════════════╗\n`
                    doc += `║   🔒 *GRUPO NÃO ALUGADO / EXPIRADO*   ║\n`
                    doc += `╚══════════════════════════════╝\n\n`
                    doc += `⚠️ O bot está com o *Modo Aluguel ATIVO* neste grupo.\n\n`
                    doc += `💰 *Para liberar todos os comandos e recursos:*\n`
                    doc += `Realize o pagamento do aluguel ou contate os Donos oficiais.\n\n`
                    doc += `📋 *Opções Disponíveis:*\n`
                    doc += `👉 Digite \`${prefix}aluguel planos\` para consultar preços e prazos\n`
                    doc += `👉 Digite \`${prefix}dono\` para falar com um administrador autorizado\n\n`
                    doc += `💡 _Dono do Bot:_ Digite \`${prefix}aluguel set <tempo>\` ou \`${prefix}aluguel set vitalicio\` para liberar este grupo.`
                    await reply(doc.trim())
                    return true
                }
            }
        }
    }

    // 10. Verificação de Estado Operacional (Bot Lifecycle Scheduler)
    const botState = botScheduler.getBotState()
    if (botState === botScheduler.BOT_STATES.OFFLINE && userRole.level < ROLES.BOT_ADMIN) {
        await reply('🔴 *BOT FECHADO:* O bot está em horário de fechamento programado pela administração. Aguarde a reabertura.')
        return true
    }

    // 11. Verificação de Rate Limit / Anti-Spam com Tolerância Escalonada
    const isTrusted = userRole.level >= ROLES.TRUSTED
    const rateCheck = securityService.checkRateLimit(roleJid, isOwnerOrBotAdmin, isTrusted)
    if (rateCheck.blocked) {
        await reply(rateCheck.reason)
        return true
    }

    // 8. Cooldown Global por Usuário (mínimo 1.5s entre comandos diferentes para evitar flood)
    if (userRole.level < ROLES.BOT_ADMIN && process.env.NODE_ENV !== 'test') {
        const userCooldownKey = `user_global:${roleJid}`
        const now = Date.now()
        const lastUserCmd = cooldowns.get(userCooldownKey) || 0
        const globalCooldown = 1500

        if (now - lastUserCmd < globalCooldown) {
            const segundosRestantes = ((globalCooldown - (now - lastUserCmd)) / 1000).toFixed(1)
            await reply(`⏱️ *Calma aí!* Aguarde ${segundosRestantes}s para enviar outro comando.`)
            return true
        }
        cooldowns.set(userCooldownKey, now)
    }

    // 9. Cooldown Individual do Comando
    const cooldownDuration = cmd.cooldownMs !== undefined ? cmd.cooldownMs : (env.defaultCooldownMs || 2000)
    if (cooldownDuration > 0 && userRole.level < ROLES.TRUSTED) {
        const cooldownKey = `${roleJid}:${cmd.name}`
        const now = Date.now()
        const lastExecuted = cooldowns.get(cooldownKey) || 0

        if (now - lastExecuted < cooldownDuration) {
            const segundosRestantes = Math.ceil((cooldownDuration - (now - lastExecuted)) / 1000)
            await reply(`⏱️ Aguarde ${segundosRestantes}s para usar \`.${cmd.name}\` novamente.`)
            return true
        }
        cooldowns.set(cooldownKey, now)
    }

    const startTime = Date.now()
    try {
        await cmd.execute(context)
        const latencyMs = Date.now() - startTime
        telemetryService.recordExecution(cmd.name, latencyMs, true)
        analyticsRepo.recordCommandUsage(cmd.name, cmd.category || 'geral')

        if (context.sender) {
            try {
                // Incremento atômico: não lê nem reescreve a linha inteira (antes
                // custava um SELECT * de todos os usuários por comando e ainda
                // sobrescrevia o que o próprio comando acabara de gravar).
                userRepo.incrementCommandCount(context.sender, context.isGroup)
            } catch (e) {
                logger.warn(`[CMD COUNTER] falha ao incrementar contador de ${context.sender}: ${e.message}`)
            }
        }

        return true
    } catch (err) {
        const latencyMs = Date.now() - startTime
        telemetryService.recordExecution(cmd.name, latencyMs, false, err)
        logger.error(`[COMMAND ERROR] Falha ao executar ${cmd.name} de ${sender}:`, err)
        await reply(`❌ Ocorreu um erro ao processar o comando .${cmd.name}. Tente novamente.`)
        return true
    }
}

function getCommands() {
    return commands
}

function getAliases() {
    return aliases
}

function levenshteinDistance(s1, s2) {
    s1 = s1.toLowerCase()
    s2 = s2.toLowerCase()
    const costs = []
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j
            else {
                if (j > 0) {
                    let newValue = costs[j - 1]
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
                    }
                    costs[j - 1] = lastValue
                    lastValue = newValue
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue
    }
    return costs[s2.length]
}

function findCommand(nameOrAlias) {
    if (!nameOrAlias) return null
    const clean = nameOrAlias.toLowerCase().replace(/^[.!#\/]/, '').trim()
    return commands.get(clean) || aliases.get(clean) || null
}

function findClosestCommand(input) {
    if (!input || typeof input !== 'string') return null
    const clean = input.toLowerCase().replace(/^[.!#\/]/, '').trim()
    const allNames = Array.from(new Set([...commands.keys(), ...aliases.keys()]))
    let bestMatch = null
    let minDistance = Infinity

    for (const name of allNames) {
        const dist = levenshteinDistance(clean, name)
        if (dist < minDistance && dist <= (clean.length <= 4 ? 1 : 3)) {
            minDistance = dist
            bestMatch = name
        }
    }
    return bestMatch ? (commands.get(bestMatch) || aliases.get(bestMatch)) : null
}

function findClosestCommands(input, limit = 5, ctx = null) {
    if (!input || typeof input !== 'string') return []
    const query = input.toLowerCase().replace(/^[.!#\/]/, '').trim()
    if (!query) return []

    // Não sugere comandos que o usuário não poderia executar (evita expor
    // comandos de owner/admin a membros comuns). Sem ctx, não filtra.
    const canSee = (cmdObj) => {
        if (!ctx || !ctx.userRole) return true
        try {
            return canExecuteCommand(ctx.userRole, cmdObj, { isGroup: ctx.isGroup, isBotAdmin: ctx.isBotAdmin }).allowed
        } catch (_) {
            return true
        }
    }

    const allNames = Array.from(new Set([...commands.keys(), ...aliases.keys()]))
    const scored = []
    const seenCmdNames = new Set()

    // 1. Prefix Match (Comandos ou aliases que começam com a query digitada)
    for (const name of allNames) {
        if (name.startsWith(query)) {
            const cmdObj = commands.get(name) || aliases.get(name)
            if (cmdObj && !seenCmdNames.has(cmdObj.name) && canSee(cmdObj)) {
                seenCmdNames.add(cmdObj.name)
                scored.push({ cmd: cmdObj, priority: 1, score: query.length / name.length })
            }
        }
    }

    // 2. Substring Match (Comandos ou aliases que contêm a query)
    if (query.length >= 3) {
        for (const name of allNames) {
            if (name.includes(query)) {
                const cmdObj = commands.get(name) || aliases.get(name)
                if (cmdObj && !seenCmdNames.has(cmdObj.name) && canSee(cmdObj)) {
                    seenCmdNames.add(cmdObj.name)
                    scored.push({ cmd: cmdObj, priority: 2, score: query.length / name.length })
                }
            }
        }
    }

    // 3. Levenshtein com filtro estrito de relevância (evita sugerir comandos desconexos)
    if (scored.length < limit) {
        for (const name of allNames) {
            const cmdObj = commands.get(name) || aliases.get(name)
            if (!cmdObj || seenCmdNames.has(cmdObj.name) || !canSee(cmdObj)) continue

            const dist = levenshteinDistance(query, name)
            let isRelevant = false

            if (query.length <= 3) {
                // Para palavras curtas (ex: 'rpg'), apenas aceita se compartilhar a 1ª letra e tiver distância 1
                isRelevant = dist === 1 && name[0] === query[0]
            } else if (query.length <= 5) {
                isRelevant = dist <= 2 && (name.slice(0, 2) === query.slice(0, 2) || name.includes(query.slice(0, 3)))
            } else {
                isRelevant = dist <= 3 && (name.slice(0, 2) === query.slice(0, 2) || name.slice(-2) === query.slice(-2))
            }

            if (isRelevant) {
                seenCmdNames.add(cmdObj.name)
                scored.push({ cmd: cmdObj, priority: 3, score: 1 / (dist + 1) })
            }
        }
    }

    scored.sort((a, b) => (a.priority - b.priority) || (b.score - a.score))
    return scored.slice(0, limit).map(item => item.cmd).filter(Boolean)
}

module.exports = {
    loadCommands,
    dispatch,
    getCommands,
    getAliases,
    getValidationReport,
    findCommand,
    findClosestCommand,
    findClosestCommands,
    commands,
    aliases,
    cooldowns
}
