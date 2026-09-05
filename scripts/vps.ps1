<#
.SYNOPSIS
    Gerenciador rápido da VPS MeliodasBotXP para Windows PowerShell.

.DESCRIPTION
    Permite visualizar logs, status, reiniciar o bot e conectar via SSH com 1 comando.

.EXAMPLE
    .\scripts\vps.ps1 logs
    .\scripts\vps.ps1 status
    .\scripts\vps.ps1 restart
    .\scripts\vps.ps1 ssh
    .\scripts\vps.ps1 deploy
#>

param (
    [Parameter(Position = 0)]
    [ValidateSet("ssh", "logs", "status", "restart", "deploy", "qr")]
    [string]$Action = "status"
)

$VpsHost = "vps"

switch ($Action) {
    "ssh" {
        Write-Host "🌐 Conectando à VPS via SSH..." -ForegroundColor Cyan
        ssh $VpsHost
    }
    "logs" {
        Write-Host "📜 Acompanhando logs do MeliodasBotXP em tempo real (Ctrl+C para sair)..." -ForegroundColor Yellow
        ssh -t $VpsHost "docker logs --tail 50 -f meliodas_bot_xp"
    }
    "status" {
        Write-Host "📊 Verificando status dos serviços na VPS..." -ForegroundColor Green
        ssh $VpsHost "docker ps --filter name=meliodas_bot_xp --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    }
    "restart" {
        Write-Host "🔄 Reiniciando container do bot na VPS..." -ForegroundColor Magenta
        ssh $VpsHost "docker restart meliodas_bot_xp"
        Write-Host "✅ Bot reiniciado com sucesso!" -ForegroundColor Green
    }
    "deploy" {
        Write-Host "🚀 Atualizando e recompilando na VPS..." -ForegroundColor Cyan
        ssh -t $VpsHost "cd /var/www/meliodasbotxp && git pull origin main && docker compose up -d --build meliodas-bot"
        Write-Host "✅ Deploy concluído na VPS!" -ForegroundColor Green
    }
    "qr" {
        Write-Host "📲 Abrindo visualização de status do QR Code..." -ForegroundColor Cyan
        curl.exe -s "http://179.198.117.134:3000/status"
        Write-Host ""
    }
}

