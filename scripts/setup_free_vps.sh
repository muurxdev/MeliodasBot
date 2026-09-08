#!/usr/bin/env bash
# ==============================================================================
# 🚀 MELIODAS BOT XP — SETUP AUTOMATIZADO PARA VPS GRATUITA (UBUNTU / DEBIAN)
# ==============================================================================
# Este script prepara uma VPS limpa (Oracle Cloud Free, Google Cloud e2-micro,
# AWS t2.micro, etc.) para rodar o MeliodasBot perfeitamente.
#
# O que este script faz:
# 1. Configura 4 GB de memória SWAP (evita travamentos de RAM em VPS de 1GB).
# 2. Atualiza pacotes do sistema (apt update/upgrade).
# 3. Instala Docker e Docker Compose oficial.
# 4. Configura firewall básico (SSH na porta 22 e painel QR na porta 3000).
# 5. Otimiza parâmetros de kernel para estabilidade de containers.
#
# Como rodar na VPS nova:
#   curl -fsSL https://raw.githubusercontent.com/muurxdev/MeliodasBot/main/scripts/setup_free_vps.sh | bash
# ==============================================================================

set -euo pipefail

echo "=================================================="
echo "⚡ INICIANDO CONFIGURAÇÃO DE VPS GRATUITA PARA O BOT"
echo "=================================================="

# 1. Criação de 4GB de SWAP se não houver swap configurado
if [ "$(free -m | awk '/^Swap:/ {print $2}')" -lt 1024 ]; then
    echo "📦 Criando 4 GB de Swap para garantir estabilidade de memória..."
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    # Otimizações de swap para VPS
    sysctl vm.swappiness=20
    sysctl vm.vfs_cache_pressure=50
    echo 'vm.swappiness=20' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
    echo "✅ 4 GB de Swap ativados com sucesso!"
else
    echo "ℹ️  Swap já configurado no sistema."
fi

# 2. Atualização do Sistema e ferramentas básicas
echo "🔄 Atualizando repositórios do sistema..."
apt-get update -y && apt-get install -y --no-install-recommends \
    curl \
    git \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    rsync

# 3. Instalação do Docker e Docker Compose oficial
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker oficial..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker instalado com sucesso!"
else
    echo "ℹ️  Docker já está instalado."
fi

# 4. Configuração do Firewall (UFW)
echo "🛡️ Configurando portas básicas de firewall (22 SSH, 3000 Painel QR)..."
ufw allow 22/tcp || true
ufw allow 3000/tcp || true
echo "y" | ufw enable || true

# 5. Preparação da pasta do projeto
TARGET_DIR="/var/www/meliodasbotxp"
mkdir -p "$TARGET_DIR"

echo "=================================================="
echo "🎉 VPS PREPARADA COM SUCESSO!"
echo "=================================================="
echo ""
echo "📌 Próximos passos para ligar o bot:"
echo "1. Clone o repositório:"
echo "   cd /var/www/meliodasbotxp"
echo "   git clone https://github.com/muurxdev/MeliodasBot.git ."
echo ""
echo "2. Copie seu arquivo .env:"
echo "   nano .env"
echo ""
echo "3. Se a VPS tiver 1GB ou 2GB de RAM (ex: Google Cloud ou AWS):"
echo "   docker compose -f docker-compose.lite.yml up -d --build"
echo ""
echo "4. Se a VPS for a Oracle Cloud (4 a 24GB de RAM):"
echo "   docker compose up -d --build"
echo ""
echo "5. Veja os logs:"
echo "   docker logs -f meliodas_bot_xp"
echo "=================================================="
