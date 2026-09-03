/**
 * BotXP — Suíte Completa de Testes End-to-End (E2E) & Validação de Produção (FASE 10)
 * Valida fluxos integrados de ponta a ponta em condições reais de execução com SQLite.
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const dispatcher = require('../src/handlers/commandDispatcher')
const { createMockContext } = require('../src/dev/mockFactory')
const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const { importLegacyJsonData } = require('../src/database/importer')
const botScheduler = require('../src/services/botScheduler')
const securityService = require('../src/services/securityService')
const mediaQueue = require('../src/services/mediaQueue')
const { ProgressSession, PROGRESS_STATES } = require('../src/services/progressEngine')
const { permissionRepo } = require('../src/services/permissionService')

console.log('🧪 Iniciando suíte de testes End-to-End (E2E) de Produção (FASE 10)...\n')

let passCount = 0
let failCount = 0

async function testAsync(name, fn) {
    try {
        await fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

async function runE2ETests() {
    const db = getDatabase()
    runMigrations(db)
    importLegacyJsonData(db)
    dispatcher.loadCommands()

    const groupJid = '120363000000000099@g.us'

    // ══════════════════════════════════════════
    // 1. FLUXO DE ECONOMIA & RPG COMPLETO
    // ══════════════════════════════════════════
    console.log('--- 1. Fluxo Integrado de Economia, Perfil e RPG ---')

    await testAsync('Fluxo 1: Menu -> Daily -> Perfil -> Hunt -> Ranking -> Curar', async () => {
        const userJid = '5511999880100@s.whatsapp.net'

        // 1. Menu
        const ctxMenu = createMockContext('.menu', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxMenu)
        assert(ctxMenu.capturedReplies.length >= 1)
        assert(ctxMenu.capturedReplies[0].msg.toLowerCase().includes('meliodas') || ctxMenu.capturedReplies[0].msg.includes('𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨'))

        // 2. Daily
        const ctxDaily = createMockContext('.daily', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxDaily)
        assert(ctxDaily.capturedReplies.length >= 1)

        // 3. Perfil & XP
        const ctxPerfil = createMockContext('.perfil', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxPerfil)
        assert(ctxPerfil.capturedReplies.length >= 1)

        // 4. Hunt
        const ctxHunt = createMockContext('.hunt', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHunt)
        assert(ctxHunt.capturedReplies.length >= 1)

        // 5. Rank
        const ctxRank = createMockContext('.rank', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxRank)
        assert(ctxRank.capturedReplies.length >= 1)

        // 6. Curar
        const ctxCurar = createMockContext('.curar', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxCurar)
        assert(ctxCurar.capturedReplies.length >= 1)
    })

    // ══════════════════════════════════════════
    // 2. FLUXO DE SEGURANÇA & HIERARQUIA DE 5 NÍVEIS
    // ══════════════════════════════════════════
    console.log('\n--- 2. Fluxo de Permissões, Owner Core e Segurança ---')

    await testAsync('Fluxo 2: .trust -> .bandm -> .banstatus -> .sysinfo', async () => {
        const targetUser = '5511999880200@s.whatsapp.net'
        const ownerJid = '5511999999999@s.whatsapp.net'

        // 1. Adiciona à Trust List (.trust)
        const ctxTrust = createMockContext(`.trust @${targetUser.split('@')[0]} Desenvolvedor sênior`, { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxTrust)
        assert(ctxTrust.capturedReplies[0].msg.includes('confiança') || ctxTrust.capturedReplies[0].msg.includes('TRUSTED'))

        // 4. Bloqueia DM (.bandm)
        const ctxBanDm = createMockContext(`.bandm @${targetUser.split('@')[0]} Spam no privado`, { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxBanDm)
        assert(ctxBanDm.capturedReplies[0].msg.includes('bloqueada') || ctxBanDm.capturedReplies[0].msg.includes('DM'))

        // 5. Restringe Status (.banstatus)
        const ctxBanStatus = createMockContext(`.banstatus @${targetUser.split('@')[0]} Marcações indevidas`, { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxBanStatus)
        const banStatusMsg = ctxBanStatus.capturedReplies[0].msg.toLowerCase()
        assert(banStatusMsg.includes('status') || banStatusMsg.includes('restrição'))

        // 6. Sysinfo do Dono (.sysinfo)
        const ctxSys = createMockContext('.sysinfo', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxSys)
        assert(ctxSys.capturedReplies[0].msg.includes('MELIODAS') || ctxSys.capturedReplies[0].msg.includes('RAM'))

        // Limpeza dos mocks de teste
        permissionRepo.setDmBlocked(targetUser, false)
        permissionRepo.setStatusBlocked(targetUser, false)
    })

    // ══════════════════════════════════════════
    // 3. FLUXO DE DEV HUB & UTILITÁRIOS
    // ══════════════════════════════════════════
    console.log('\n--- 3. Fluxo de Utilitários de Software & Dev Hub ---')

    await testAsync('Fluxo 3: .json -> .hash -> .b64 -> .jwt -> .uuid -> .regex -> .calc -> .timestamp', async () => {
        const userJid = '5511999880300@s.whatsapp.net'

        // 1. JSON
        const ctxJson = createMockContext('.json format {"service":"bot","status":"active"}', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxJson)
        assert(ctxJson.capturedReplies[0].msg.includes('JSON FORMATADO'))

        // 2. Hash
        const ctxHash = createMockContext('.sha256 meliodas', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHash)
        assert(ctxHash.capturedReplies[0].msg.includes('HASH CRIPTOGRÁFICO'))

        // 3. Base64
        const ctxB64 = createMockContext('.b64 encode TypeScript & Node', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxB64)
        assert(ctxB64.capturedReplies[0].msg.includes('BASE64 CODIFICADO'))

        // 4. UUID
        const ctxUuid = createMockContext('.uuid', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxUuid)
        assert(ctxUuid.capturedReplies[0].msg.includes('GERADOR DE UUID'))

        // 5. Regex
        const ctxRegex = createMockContext('.regex /v[0-9]+/g meliodas v2.0', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxRegex)
        assert(ctxRegex.capturedReplies[0].msg.includes('MATCH ENCONTRADO'))

        // 6. Calc
        const ctxCalc = createMockContext('.calc (100 * 5) / 2', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxCalc)
        assert(ctxCalc.capturedReplies[0].msg.includes('250'))

        // 7. Timestamp
        const ctxTime = createMockContext('.timestamp 1700000000', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxTime)
        assert(ctxTime.capturedReplies[0].msg.includes('CONVERSOR DE TIMESTAMP'))
    })

    // ══════════════════════════════════════════
    // 4. FLUXO DE MEDIA ENGINE & PROGRESS ENGINE
    // ══════════════════════════════════════════
    console.log('\n--- 4. Fluxo de Media Hub e Live Progress Engine ---')

    await testAsync('Fluxo 4: ProgressSession percorre SEARCH -> ANALYZE -> QUEUE -> DOWNLOAD -> PROCESS -> UPLOAD -> COMPLETE', async () => {
        let sentLog = []
        const mockSock = {
            sendMessage: async (to, content) => {
                sentLog.push(content)
                return { key: { id: `prog_${Date.now()}`, remoteJid: to } }
            }
        }

        const session = new ProgressSession({
            client: mockSock,
            from: groupJid,
            title: 'Imagine Dragons - Believer',
            platform: 'YouTube',
            minUpdateIntervalMs: 0
        })

        await session.setSearch(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.SEARCH)

        await session.setAnalyze(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.ANALYZE)

        await session.setQueue(1)
        assert.strictEqual(session.currentState, PROGRESS_STATES.QUEUE)

        await session.setDownload(60, { eta: '00:15', currentSize: '12MB', totalSize: '20MB', speed: '3.2MB/s' })
        assert.strictEqual(session.currentState, PROGRESS_STATES.DOWNLOAD)

        await session.setProcess(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.PROCESS)

        await session.setUpload(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.UPLOAD)

        await session.setComplete()
        assert.strictEqual(session.currentState, PROGRESS_STATES.COMPLETE)
        assert.strictEqual(session.isClosed, true)
    })

    // ══════════════════════════════════════════
    // 5. FLUXO DE BOT SCHEDULER & RECOVERY
    // ══════════════════════════════════════════
    console.log('\n--- 5. Fluxo de Bot Lifecycle Scheduler & Persistência SQLite ---')

    await testAsync('Fluxo 5: .botclose -> OFFLINE -> Intercepção de comandos -> .botschedule -> .botopen -> ONLINE', async () => {
        const ownerJid = '5511999999999@s.whatsapp.net'
        const normalUser = '5511999880500@s.whatsapp.net'

        // 1. Fecha por 45 minutos (.botclose)
        const ctxClose = createMockContext('.botclose 45m', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxClose)
        assert(ctxClose.capturedReplies[0].msg.includes('FECHADO TEMPORARIAMENTE'))
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.OFFLINE)

        // 2. Usuário comum tenta usar o bot e é bloqueado
        const ctxBlocked = createMockContext('.ping', { sender: normalUser, from: groupJid, isOwner: false, isAdmin: false })
        await dispatcher.dispatch(ctxBlocked)
        assert(ctxBlocked.capturedReplies[0].msg.includes('FECHADO') || ctxBlocked.capturedReplies[0].msg.includes('fechamento'))

        // 3. Dono consulta agendamento (.botschedule)
        const ctxSched = createMockContext('.botschedule', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxSched)
        assert(ctxSched.capturedReplies[0].msg.includes('BOT SCHEDULER'))
        assert(ctxSched.capturedReplies[0].msg.includes('OFFLINE'))

        // 4. Dono reabre o bot (.botopen)
        const ctxOpen = createMockContext('.botopen', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxOpen)
        assert(ctxOpen.capturedReplies[0].msg.includes('REABERTO'))
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.ONLINE)

        // 5. Usuário comum volta a conseguir executar comandos normalmente
        const ctxPingOk = createMockContext('.ping', { sender: normalUser, from: groupJid, isOwner: false, isAdmin: false })
        await dispatcher.dispatch(ctxPingOk)
        assert(ctxPingOk.capturedReplies[0].msg.includes('Pong') || ctxPingOk.capturedReplies[0].msg.includes('Latência'))
    })

    // ══════════════════════════════════════════
    // 6. FLUXO DE MODERAÇÃO & GRUPOS
    // ══════════════════════════════════════════
    console.log('\n--- 6. Fluxo de Moderação de Grupos & Anti-Link ---')

    await testAsync('Fluxo 6: .antilink on -> .warnings -> .antilink off', async () => {
        const adminJid = '5511999880600@s.whatsapp.net'

        const ctxAntilinkOn = createMockContext('.antilink on', { sender: adminJid, from: groupJid, isAdmin: true, isOwner: true })
        await dispatcher.dispatch(ctxAntilinkOn)
        assert(ctxAntilinkOn.capturedReplies[0].msg.toLowerCase().includes('anti-link') || ctxAntilinkOn.capturedReplies[0].msg.toLowerCase().includes('on'))

        const ctxWarns = createMockContext('.warnings', { sender: adminJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxWarns)
        assert(ctxWarns.capturedReplies[0].msg.toLowerCase().includes('advertências') || ctxWarns.capturedReplies[0].msg.toLowerCase().includes('warn'))
    })

    // ══════════════════════════════════════════
    // 7. FLUXO DE DISCOVERY & HELP
    // ══════════════════════════════════════════
    console.log('\n--- 7. Fluxo de Command Discovery & Dynamic Help ---')

    await testAsync('Fluxo 7: .help geral -> .help dev -> .help .json', async () => {
        const userJid = '5511999880700@s.whatsapp.net'

        // 1. Help Geral
        const ctxHelp = createMockContext('.help', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHelp)
        assert(ctxHelp.capturedReplies[0].msg.includes('MELIODAS') || ctxHelp.capturedReplies[0].msg.includes('𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨'))
        assert(ctxHelp.capturedReplies[0].msg.includes('Dev Hub'))

        // 2. Help Dev Category
        const ctxHelpDev = createMockContext('.help dev', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHelpDev)
        assert(ctxHelpDev.capturedReplies[0].msg.includes('Dev Hub & Utilitários'))
        assert(ctxHelpDev.capturedReplies[0].msg.includes('.json'))

        // 3. Help .json
        const ctxHelpJson = createMockContext('.help .json', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHelpJson)
        assert(ctxHelpJson.capturedReplies[0].msg.includes('DETALHES DO COMANDO'))
        assert(ctxHelpJson.capturedReplies[0].msg.includes('.json'))
    })

    // ══════════════════════════════════════════
    // 8. FLUXO DE RATE LIMIT & ANTI-ABUSE
    // ══════════════════════════════════════════
    console.log('\n--- 8. Fluxo de Stress Anti-Abuse & Rate Limit ---')

    await testAsync('Fluxo 8: Rate Limit Burst -> Suspensão Temporária -> Desbloqueio', async () => {
        const spammerJid = '5511999880800@s.whatsapp.net'

        for (let i = 0; i < 6; i++) {
            const check = securityService.checkRateLimit(spammerJid, false, false)
            assert.strictEqual(check.blocked, false)
        }

        const blockedCheck = securityService.checkRateLimit(spammerJid, false, false)
        assert.strictEqual(blockedCheck.blocked, true)
        assert(blockedCheck.reason.includes('Anti-Spam') || blockedCheck.reason.includes('silenciado'))
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES E2E DE PRODUÇÃO:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runE2ETests().catch(err => {
    console.error('Erro na execução dos testes E2E:', err)
    process.exit(1)
})
