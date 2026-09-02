/**
 * MeliodasBot — Live Web & API QR Code Server
 * Permite visualizar e escanear o QR Code remotamente pelo navegador do PC ou terminal
 */

const http = require('http')
const QRCode = require('qrcode')
const logger = require('./logger')

let currentQr = null
let isConnected = false
let connectedUser = null
let serverInstance = null

function startQrServer(port = process.env.PORT || 3000) {
    if (serverInstance) return serverInstance

    const server = http.createServer(async (req, res) => {
        const url = req.url.split('?')[0]

        // 1. Raw QR string (usado pelo script de terminal no PC)
        if (url === '/qr.raw') {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
            return res.end(currentQr || '')
        }

        // 2. Status API
        if (url === '/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({
                connected: isConnected,
                user: connectedUser,
                hasQr: Boolean(currentQr)
            }))
        }

        // 3. Imagem PNG direta
        if (url === '/qr.png') {
            if (!currentQr) {
                res.writeHead(404, { 'Content-Type': 'text/plain' })
                return res.end('QR Code não disponível ou já autenticado.')
            }
            try {
                const imgBuffer = await QRCode.toBuffer(currentQr, { width: 400, margin: 2 })
                res.writeHead(200, { 'Content-Type': 'image/png' })
                return res.end(imgBuffer)
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                return res.end('Erro ao gerar PNG do QR Code.')
            }
        }

        // 4. Página Web Interativa (Visualização no PC)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })

        let qrDataUrl = null
        if (currentQr) {
            try {
                qrDataUrl = await QRCode.toDataURL(currentQr, { width: 320, margin: 2 })
            } catch (e) {}
        }

        let bodyHtml = ''
        if (isConnected) {
            bodyHtml = `
                <div style="background:#10b981; color:white; padding:30px; border-radius:12px; margin-top:20px;">
                    <h2 style="margin:0;">✅ BOT CONECTADO COM SUCESSO!</h2>
                    <p style="margin-top:10px; font-size:18px;">ID Conectado: <strong>${connectedUser || 'MeliodasBot'}</strong></p>
                    <p style="opacity:0.9;">O bot já está operacional e processando comandos no WhatsApp.</p>
                </div>
            `
        } else if (qrDataUrl) {
            bodyHtml = `
                <div style="background:#f8fafc; border:2px dashed #3b82f6; padding:25px; border-radius:16px; display:inline-block; margin-top:15px;">
                    <img src="${qrDataUrl}" alt="QR Code WhatsApp" style="border-radius:8px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
                    <p style="color:#1e293b; font-weight:600; margin-top:15px;">📲 Abra o WhatsApp > Aparelhos Conectados > Conectar Aparelho</p>
                </div>
            `
        } else {
            bodyHtml = `
                <div style="background:#fef3c7; color:#92400e; padding:25px; border-radius:12px; margin-top:20px;">
                    <h3 style="margin:0;">⏳ Aguardando geração do QR Code...</h3>
                    <p style="margin-top:10px;">O servidor está inicializando a conexão com o WhatsApp. A página será atualizada automaticamente.</p>
                </div>
            `
        }

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MeliodasBot — Scanner QR Code</title>
    <meta http-equiv="refresh" content="3">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; background: #0f172a; color: #f8fafc; padding: 40px 20px; }
        .container { max-width: 550px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
        h1 { color: #60a5fa; margin-top: 0; }
        .badge { background: #334155; padding: 6px 12px; border-radius: 20px; font-size: 13px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 MeliodasBot</h1>
        <span class="badge">Scanner de Autenticação Remoto</span>
        ${bodyHtml}
    </div>
</body>
</html>`

        res.end(html)
    })

    server.listen(port, '0.0.0.0', () => {
        logger.info(`🌐 [QR SERVER] Painel Web do QR Code disponível em: http://0.0.0.0:${port}`)
    })

    serverInstance = server
    return server
}

function updateQr(qrString) {
    currentQr = qrString
    isConnected = false
}

function setConnected(user) {
    isConnected = true
    connectedUser = user
    currentQr = null
}

function stopQrServer() {
    if (serverInstance) {
        serverInstance.close()
        serverInstance = null
    }
}

module.exports = {
    startQrServer,
    updateQr,
    setConnected,
    stopQrServer
}

