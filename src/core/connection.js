/**
 * MeliodasBot — WhatsApp Baileys Connection Manager
 * Gerencia ciclo de vida da conexão, autenticação, eventos e reconexão com backoff
 */

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const { spawn } = require('child_process')
const { sessaoDir } = require('../config/paths')
const { handleIncomingMessage, invalidateGroupCache } = require('../handlers/messageHandler')
const groupAuthService = require('../services/groupAuthService')
const { startQrServer, updateQr, setConnected } = require('./qrServer')
const logger = require('./logger')

let clientInstance = null
let reconnectTimeout = null
let reconnectDelayMs = 2000
let isShuttingDown = false

/**
 * Tenta atualizar o yt-dlp dentro do canal nightly (best-effort, não bloqueante).
 * O canal nightly acompanha as mudanças das plataformas (ex: correções do TikTok)
 * mais rápido que o estável. Falha silenciosa se sem permissão de escrita.
 */
function updateYtDlpOnce() {
    try {
        spawn('yt-dlp', ['--update-to', 'nightly'], { stdio: 'ignore' }).on('error', () => {})
    } catch (_) {}
}

/**
 * Inicia a conexão com o WhatsApp usando Baileys
 * @returns {Promise<object>} Instância do cliente Baileys
 */
async function startBot() {
    if (isShuttingDown) {
        logger.warn('[BOOT] Inicialização cancelada: processo em encerramento.')
        return null
    }

    // Inicializa o servidor Web de QR Code
    startQrServer()

    // Mantém o yt-dlp atualizado para acompanhar mudanças das plataformas
    updateYtDlpOnce()

    if (!fs.existsSync(sessaoDir)) {
        fs.mkdirSync(sessaoDir, { recursive: true })
    }

    logger.info(`[WHATSAPP] Carregando credenciais de sessão em: ${sessaoDir}`)
    const { state, saveCreds } = await useMultiFileAuthState(sessaoDir)
    const { version, isLatest } = await fetchLatestBaileysVersion()

    logger.info(`[WHATSAPP] Versão Baileys: v${version.join('.')} (isLatest: ${isLatest})`)

    const client = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 15000
    })

    clientInstance = client

    // Vincula o cliente Baileys ao serviço de autenticação de grupos
    groupAuthService.attach(client)

    // 1. Atualização de credenciais de autenticação
    client.ev.on('creds.update', saveCreds)

    // 2. Atualização de status da conexão
    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            updateQr(qr)
            console.log('\n==================================================')
            console.log('📲 [WHATSAPP] ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:')
            console.log('🌐 Ou acesse pelo navegador no PC: http://<IP_DA_VPS>:3000')
            console.log('==================================================\n')
            try {
                const qrcodeTerminal = require('qrcode-terminal')
                qrcodeTerminal.generate(qr, { small: true })
            } catch (e) {
                logger.info(`[WHATSAPP QR STRING]: ${qr}`)
            }
            console.log('\n==================================================\n')
        }

        if (connection === 'connecting') {
            logger.info('[WHATSAPP] 🔄 Conectando aos servidores do WhatsApp...')
        }

        if (connection === 'open') {
            setConnected(client.user?.id || 'Bot')

            // Nova sessão/relançamento: descarta metadata de grupos obsoletos
            groupAuthService.invalidateAll()

            logger.info('==================================================')
            logger.info('🚀 [READY] MeliodasBot CONECTADO COM SUCESSO!')
            logger.info(`👤 Usuário Conectado: ${client.user?.id || 'Bot'}`)
            logger.info('==================================================')
            reconnectDelayMs = 2000 // Reseta o delay de reconexão
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut

            logger.warn(`[WHATSAPP] Conexão encerrada. Código de status: ${statusCode || 'desconhecido'}`)

            if (statusCode === DisconnectReason.loggedOut) {
                logger.error('❌ [WHATSAPP] Sessão desconectada (Logged Out). Limpe a pasta sessao/ e gere um novo QR Code.')
                clientInstance = null
                return
            }

            if (shouldReconnect && !isShuttingDown) {
                logger.info(`[WHATSAPP] Tentando reconectar em ${reconnectDelayMs / 1000}s...`)
                clearTimeout(reconnectTimeout)
                reconnectTimeout = setTimeout(() => {
                    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000)
                    startBot().catch(err => {
                        logger.error('[WHATSAPP] Erro na tentativa de reconexão:', err)
                    })
                }, reconnectDelayMs)
            }
        }
    })

    // 3. Recebimento de mensagens
    client.ev.on('messages.upsert', async (upsertData) => {
        try {
            await handleIncomingMessage(client, upsertData)
        } catch (err) {
            logger.error('[MESSAGE HANDLER ERROR]', err)
        }
    })

    // 4. Atualização de metadados dos grupos (admin mudado, título, etc.)
    client.ev.on('groups.update', (updates) => {
        for (const update of updates || []) {
            if (update?.id) {
                invalidateGroupCache(update.id)
            }
        }
    })

    // 5. Mudanças de participantes (promovido/rebaixado/entrou/saiu)
    client.ev.on('group-participants.update', async (update) => {
        try {
            if (update?.id) {
                invalidateGroupCache(update.id)
                const { handleGroupParticipantsUpdate } = require('../handlers/groupEventsHandler')
                await handleGroupParticipantsUpdate(client, update)
            }
        } catch (err) {
            logger.error('[GROUP_PARTICIPANTS_UPDATE ERROR]', err)
        }
    })

    return client
}

/**
 * Retorna a instância atual do cliente Baileys
 */
function getClient() {
    return clientInstance
}

/**
 * Fecha a conexão de forma limpa
 */
async function closeBot() {
    isShuttingDown = true
    clearTimeout(reconnectTimeout)

    if (clientInstance) {
        logger.info('[WHATSAPP] Encerrando conexão do socket...')
        try {
            if (clientInstance.ws) {
                clientInstance.ws.close()
            }
        } catch (err) {
            logger.warn('[WHATSAPP] Aviso ao fechar socket:', err.message)
        }
        clientInstance = null
    }
}

module.exports = {
    startBot,
    getClient,
    closeBot
}
