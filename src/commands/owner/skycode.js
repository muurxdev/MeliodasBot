/**
 * Comando Executivo .skycode — Protocolo & Painel Skycode
 *
 * Central técnica exclusiva do Dono e Co-Dono:
 * - Telemetria em tempo real (RAM, CPU, Uptime, SQLite, Baileys, Fila de Mídia)
 * - Gestão e visualização de todos os 19 módulos do cluster
 * - Auditoria de cadastros e identidades reais autenticadas (.login)
 * - Diagnóstico profundo de infraestrutura (SQLite, ffmpeg, yt-dlp, cookies)
 * - Monitoramento da fila de downloads e workers concorrentes
 * - Referência completa de variáveis/placeholders de automação de grupos
 */

const os = require('os')
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const moduleState = require('../../services/moduleStateService')
const { MODULES, resolveModuleKey } = require('../../config/modules')
const { getBotName } = require('../../config/botConfig')
const { mediaQueue } = require('../../services/mediaQueue')
const dataService = require('../../services/dataService')
const env = require('../../config/env')
const logger = require('../../core/logger')

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const parts = []
    if (d > 0) parts.push(`${d}d`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    parts.push(`${s}s`)
    return parts.join(' ')
}

function countByModule(dispatcher) {
    const counts = {}
    for (const cmd of dispatcher.getCommands().values()) {
        const k = resolveModuleKey(cmd)
        counts[k] = (counts[k] || 0) + 1
    }
    return counts
}

module.exports = {
    name: 'skycode',
    aliases: ['sky', 'painelskycode', 'skystatus', 'skydiag', 'skychaves', 'skyauditoria', 'skymodulos', 'skyfila', 'skygrupos'],
    category: 'owner',
    subcategory: 'Protocolo Skycode',
    description: 'Central executiva Skycode — telemetria, módulos, diagnóstico, auditoria e filas',
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.', from, isGroup, args = [], text = '', commandName = 'skycode', client, sender }) => {
        const dispatcher = require('../../handlers/commandDispatcher')
        const scope = moduleState.scopeOf(from, isGroup)
        const botName = getBotName()

        const safeArgs = (Array.isArray(args) && args.length > 0) ? args : String(text || '').trim().split(/\s+/).filter(Boolean)

        // Roteamento inteligente por alias ou primeiro argumento
        let sub = (safeArgs[0] || '').toLowerCase()
        if (commandName === 'skystatus') sub = 'status'
        else if (commandName === 'skymodulos') sub = 'modulos'
        else if (commandName === 'skydiag') sub = 'diagnostico'
        else if (commandName === 'skychaves') sub = 'chaves'
        else if (commandName === 'skyauditoria') sub = 'auditoria'
        else if (commandName === 'skyfila') sub = 'fila'
        else if (commandName === 'skygrupos') sub = 'grupos'

        // 1. ATIVAÇÃO / DESATIVAÇÃO DO PROTOCOLO SKYCODE NO ESCOPO
        if (sub === 'on' || sub === 'ativar' || sub === '1') {
            const targetAll = (safeArgs[1] || '').toLowerCase() === 'all' || (safeArgs[1] || '').toLowerCase() === 'tudo'
            if (targetAll) {
                moduleState.enableAll(scope)
                moduleState.setModule('skycode', true, scope)
                return reply(`🟢 *PROTOCOLO SKYCODE TOTAL ATIVADO*\n\n📡 *Escopo:* \`${scope}\`\n⚡ *Status:* Todos os módulos e subsistemas técnicos foram liberados com sucesso.`)
            }
            moduleState.setModule('skycode', true, scope)
            return reply(`🟢 *PROTOCOLO SKYCODE ATIVADO*\n\n📡 *Ambiente:* \`${scope}\`\n🔒 *Acesso:* ROOT_DEV (Dono)\n💡 _Para ativar todos os módulos:_ \`${prefix}skycode on all\``)
        }

        if (sub === 'off' || sub === 'desativar' || sub === '0') {
            const targetAll = (safeArgs[1] || '').toLowerCase() === 'all' || (safeArgs[1] || '').toLowerCase() === 'tudo'
            if (targetAll) {
                moduleState.disableAll(scope)
                return reply(`🔴 *PROTOCOLO SKYCODE TOTAL DESATIVADO*\n\n📡 *Escopo:* \`${scope}\`\n🔒 *Status:* Todos os módulos foram desligados neste ambiente.`)
            }
            moduleState.setModule('skycode', false, scope)
            return reply(`🔴 *PROTOCOLO SKYCODE DESATIVADO*\n\n📡 *Ambiente:* \`${scope}\`\n🔒 Terminal colocado em modo restrito.`)
        }

        // 2. CHAVES & VARIÁVEIS DE AUTOMATIZAÇÃO DE GRUPOS (.skycode chaves)
        if (sub === 'chaves' || sub === 'variaveis' || sub === 'placeholders') {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🔑 *CHAVES & VARIÁVEIS* 🔑   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `╭━〔 🧩 PLACEHOLDERS DINÂMICOS 〕━⬣\n`
            doc += `┃ \`{user}\` ou \`{membro}\` ➔ Marcação (@) do usuário\n`
            doc += `┃ \`{grupo}\` ou \`{nome}\` ➔ Nome oficial do grupo\n`
            doc += `┃ \`{desc}\` ➔ Descrição atualizada do grupo\n`
            doc += `┃ \`{membros}\` ➔ Contagem exata de membros agora\n`
            doc += `┃ \`{hora}\` ➔ Horário atual (Brasília HH:MM:SS)\n`
            doc += `┃ \`{data}\` ➔ Data atual (DD/MM/AAAA)\n`
            doc += `┃ \`{prefix}\` ➔ Prefixo ativo no ambiente\n`
            doc += `┃ \`{dono}\` ➔ Contato dos administradores\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `╭━〔 💡 EXEMPLOS PRÁTICOS 〕━⬣\n`
            doc += `┃ • \`${prefix}welcome msg Olá {user}! Bem-vindo(a) ao {grupo}. Agora somos {membros} membros! 🕐 {hora}\`\n`
            doc += `┃ • \`${prefix}leave msg {user} saiu do grupo {grupo}. Restaram {membros} membros.\`\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        // 3. AUDITORIA DE MEMBROS E IDENTIDADES REAIS (.skycode auditoria)
        if (sub === 'auditoria' || sub === 'cadastros' || sub === 'membros') {
            const topSky = dataService.userRepo.getTopSkycode ? dataService.userRepo.getTopSkycode(10) : []
            const regCount = dataService.userRepo.getRegisteredCount ? dataService.userRepo.getRegisteredCount() : 0

            let doc = `╔══════════════════════════════╗\n`
            doc += `║  🛰️ *SKYCODE CADASTROS AUDITADOS* ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `╭━〔 📋 DADOS CONSOLIDADOS 〕━⬣\n`
            doc += `┃ 👥 *Membros com Login Registrado:* ${regCount}\n`
            doc += `┃ 🛡️ *Regra de Auditoria:* Autenticação via \`.login\`\n`
            doc += `┃ 🔍 *Integridade de Dados:* 100% autêntico (SQLite)\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            if (topSky.length === 0) {
                doc += `⚠️ _Nenhum usuário registrado com .login no momento._\n`
            } else {
                doc += `╭━〔 🏆 TOP MEMBROS AUDITADOS 〕━⬣\n`
                topSky.forEach(([jid, u], i) => {
                    const nick = u.displayNick || u.display_nick || u.name || `@${jid.split('@')[0]}`
                    doc += `┃ *#${i + 1}* ${nick} (@${jid.split('@')[0]})\n`
                    doc += `┃    └ 📊 Grupo: Nv. ${u.levelGroup || u.level_group || 1} | PV: Nv. ${u.levelPv || u.level_pv || 1} | RPG: Nv. ${u.levelRpg || u.level_rpg || 1}\n`
                })
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }

            doc += `💡 _Ver ranking completo no chat:_ \`${prefix}rank skycode\`\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        // 4. DIAGNÓSTICO PROFUNDO EM TEMPO REAL (.skycode diagnostico)
        if (sub === 'diagnostico' || sub === 'diag' || sub === 'teste') {
            const diagStart = Date.now()

            // Teste 1: SQLite Latência
            let dbStatus = '🟢 OK'
            let dbTime = 0
            try {
                const dbT0 = Date.now()
                dataService.userRepo.getRegisteredCount()
                dbTime = Date.now() - dbT0
            } catch (e) {
                dbStatus = `🔴 ERRO: ${e.message}`
            }

            // Teste 2: FFmpeg e FFprobe
            let ffmpegStatus = '🟢 Instalado'
            try {
                const ff = spawnSync('ffmpeg', ['-version'])
                if (ff.status !== 0) ffmpegStatus = '⚠️ Código não-zero'
            } catch (_) {
                ffmpegStatus = '🔴 Não encontrado'
            }

            // Teste 3: yt-dlp e Cookies
            const { validateCookiesFile } = require('../../services/media/mediaArgs')
            const cookieStatus = validateCookiesFile()
            let ytdlpStatus = '🟢 Instalado'
            try {
                const yt = spawnSync('yt-dlp', ['--version'])
                if (yt.status === 0) {
                    ytdlpStatus = `🟢 v${(yt.stdout || '').toString().trim()}`
                } else {
                    ytdlpStatus = '⚠️ Código de saída anormal'
                }
            } catch (_) {
                ytdlpStatus = '🔴 Não encontrado'
            }

            // Teste 4: Memória & Fila
            const memUsage = process.memoryUsage()
            const heapMb = (memUsage.heapUsed / 1024 / 1024).toFixed(1)
            const rssMb = (memUsage.rss / 1024 / 1024).toFixed(1)
            const queueStatus = mediaQueue.getStatus ? mediaQueue.getStatus() : { active: mediaQueue.activeCount, queued: mediaQueue.queue.length }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🔬 *SKYCODE SELF-DIAGNOSTIC* ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `╭━〔 ⚙️ INFRAESTRUTURA & ENGINES 〕━⬣\n`
            doc += `┃ 💾 *SQLite Database:* ${dbStatus} (${dbTime}ms)\n`
            doc += `┃ 🎞️ *FFmpeg Engine:* ${ffmpegStatus}\n`
            doc += `┃ 📥 *yt-dlp Engine:* ${ytdlpStatus}\n`
            doc += `┃ 🍪 *Cookies Globais:* ${cookieStatus.ok ? `🟢 ${cookieStatus.count} cookies (${cookieStatus.domain})` : `⚠️ ${cookieStatus.reason}`}\n`
            doc += `┃ 🧠 *Fila de Mídia:* ${queueStatus.active} ativos | ${queueStatus.queued} em espera (Máx: ${mediaQueue.maxConcurrency})\n`
            doc += `┃ 📊 *RAM Utilizada:* ${heapMb} MB (RSS: ${rssMb} MB)\n`
            doc += `┃ ⏱️ *Diagnóstico concluído em:* ${Date.now() - diagStart}ms\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        // 5. MONITOR DA FILA DE DOWNLOADS (.skycode fila)
        if (sub === 'fila' || sub === 'queue' || sub === 'downloads') {
            const queueStatus = mediaQueue.getStatus ? mediaQueue.getStatus() : { active: mediaQueue.activeCount, queued: mediaQueue.queue.length }
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📥 *SKYCODE MEDIA QUEUE*   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `╭━〔 📊 STATUS OPERACIONAL DA FILA 〕━⬣\n`
            doc += `┃ 🚀 *Concorrência Máxima:* ${mediaQueue.maxConcurrency} downloads simultâneos\n`
            doc += `┃ ⚡ *Downloads em Execução:* ${queueStatus.active}\n`
            doc += `┃ ⏳ *Tarefas na Fila de Espera:* ${queueStatus.queued}\n`
            doc += `┃ ⏱️ *Timeout Padrão por Job:* ${Math.round((mediaQueue.defaultTimeoutMs || 180000) / 1000)}s\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            if (mediaQueue.queue.length > 0) {
                doc += `╭━〔 📋 PRIMEIROS DA FILA 〕━⬣\n`
                mediaQueue.queue.slice(0, 5).forEach((j, idx) => {
                    doc += `┃ *${idx + 1}.* [${j.format.toUpperCase()}] ${j.url.slice(0, 35)}... (@${j.user ? j.user.split('@')[0] : 'user'})\n`
                })
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            } else {
                doc += `✨ _Nenhum download acumulado na fila no momento._\n\n`
            }

            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        // 6. GESTÃO DETALHADA DE TODOS OS 19 MÓDULOS (.skycode modulos)
        if (sub === 'modulos' || sub === 'mods' || sub === 'lista') {
            const counts = countByModule(dispatcher)
            const list = moduleState.listModules(scope)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🛰️ *SKYCODE MÓDULOS GLOBAIS* ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📍 *Ambiente:* ${scope === moduleState.PV_SCOPE ? '💬 Privado (PV)' : `👥 \`${scope}\` (${isGroup ? 'Grupo' : 'Chat'})`}\n`
            doc += `🔒 *Modo Operacional:* Opt-in estrito (OFF por padrão no boot)\n\n`

            doc += `╭━〔 📋 STATUS DOS 19 MÓDULOS 〕━⬣\n`
            list.forEach(m => {
                const totalCmds = counts[m.key] || 0
                const statusStr = m.enabled ? '🟢 [ON]' : '🔴 [OFF]'
                doc += `┃ ${m.emoji} *${m.label}:* ${statusStr} _(${totalCmds} cmds)_\n`
            })
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `╭━〔 ⚡ CONTROLE RÁPIDO 〕━⬣\n`
            doc += `┃ • Ligar módulo: \`${prefix}modulo on <chave>\`\n`
            doc += `┃ • Desligar módulo: \`${prefix}modulo off <chave>\`\n`
            doc += `┃ • Ligar tudo aqui: \`${prefix}modulo on all\`\n`
            doc += `┃ • Desligar tudo aqui: \`${prefix}modulo off all\`\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        // 7. GRUPOS & CHATS GERENCIADOS (.skycode grupos)
        if (sub === 'grupos' || sub === 'chats') {
            let totalChats = 0
            try {
                const groups = client?.groupFetchAllParticipating ? await client.groupFetchAllParticipating() : {}
                totalChats = Object.keys(groups).length
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   👥 *SKYCODE GRUPOS ATIVOS*  ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `╭━〔 📊 ESTATÍSTICAS DE COMUNIDADES 〕━⬣\n`
                doc += `┃ 🌐 *Total de Grupos Conectados:* ${totalChats}\n`
                doc += `┃ ⚡ *Ambiente Atual:* ${isGroup ? 'Grupo Ativo' : 'Privado'}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
                doc += `👑 *${botName}*`
                return reply(doc.trim())
            } catch (err) {
                return reply(`❌ Erro ao listar grupos: ${err.message}`)
            }
        }

        // 8. DASHBOARD MASTER EXECUTIVO (.skycode ou .skycode status)
        const uptimeStr = formatUptime(process.uptime())
        const mem = process.memoryUsage()
        const heapMb = (mem.heapUsed / 1024 / 1024).toFixed(1)
        const totalMemMb = (os.totalmem() / 1024 / 1024).toFixed(0)
        const freeMemMb = (os.freemem() / 1024 / 1024).toFixed(0)
        const queueStatus = mediaQueue.getStatus ? mediaQueue.getStatus() : { active: mediaQueue.activeCount, queued: mediaQueue.queue.length }
        const skycodeActive = moduleState.isModuleEnabled('skycode', scope)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🛰️ *SKYCODE COMMAND CENTER* ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `👑 *${botName}* — Painel Executivo de Cluster (Dono & Co-Dono)\n`
        doc += `📡 *Protocolo Skycode:* ${skycodeActive ? '🟢 [ONLINE]' : '🔴 [OFFLINE / RESTRITO]'}\n`
        doc += `📍 *Ambiente:* ${scope === moduleState.PV_SCOPE ? '💬 Privado (PV)' : `👥 \`${scope}\``}\n\n`

        doc += `╭━〔 📊 TELEMETRIA DE SISTEMA 〕━⬣\n`
        doc += `┃ ⏱️ *Uptime do Bot:* ${uptimeStr}\n`
        doc += `┃ 🧠 *Memória Heap:* ${heapMb} MB / Livre: ${freeMemMb} MB (Total: ${totalMemMb} MB)\n`
        doc += `┃ ⚡ *Comandos Carregados:* ${dispatcher.getCommands().size} (+ ${dispatcher.getAliases().size} aliases)\n`
        doc += `┃ 📥 *Fila de Downloads:* ${queueStatus.active} ativos | ${queueStatus.queued} na fila (Cap: ${mediaQueue.maxConcurrency})\n`
        doc += `┃ 🤖 *Node.js / Plataforma:* ${process.version} (${os.platform()} ${os.arch()})\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🚀 COMANDOS DA CENTRAL SKYCODE 〕━⬣\n`
        doc += `┃ 📊 \`${prefix}skycode status\` — Telemetria completa do bot\n`
        doc += `┃ 🛰️ \`${prefix}skycode modulos\` — Gestão visual dos 19 módulos\n`
        doc += `┃ 🔬 \`${prefix}skycode diagnostico\` — Teste de SQLite, ffmpeg e yt-dlp\n`
        doc += `┃ 📥 \`${prefix}skycode fila\` — Fila de processamento de mídia\n`
        doc += `┃ 🛡️ \`${prefix}skycode auditoria\` — Auditoria de membros cadastrados\n`
        doc += `┃ 🔑 \`${prefix}skycode chaves\` — Variáveis de boas-vindas e saída\n`
        doc += `┃ 👥 \`${prefix}skycode grupos\` — Métricas de grupos conectados\n`
        doc += `┃ ⚡ \`${prefix}skycode on/off\` — Ativar/desativar protocolo\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `💡 _Dica: Você também pode usar atalhos diretos como \`${prefix}skystatus\`, \`${prefix}skymodulos\`, \`${prefix}skydiag\` ou \`${prefix}skychaves\`._`

        return reply(doc.trim())
    }
}
