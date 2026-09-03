# ==========================================
# 🐳 MELIODAS BOT XP — DOCKERFILE DE PRODUÇÃO
# ==========================================

FROM node:22-bookworm-slim

# Instala dependências de sistema necessárias (FFmpeg, yt-dlp, Python, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    qpdf \
    chromium \
    fonts-liberation \
    && curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Chromium do sistema para o Pinterest (live wallpapers via puppeteer-core).
# puppeteer-core NÃO baixa Chromium — usa este binário.
ENV CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

# Copia arquivos de definição de dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --omit=dev

# Copia o código-fonte
COPY . .

# Instala o plugin de PO Token Provider (bgutil) para o yt-dlp,
# usado no bypass do bloqueio "Sign in to confirm you're not a bot"
RUN mkdir -p ytdlp_plugins \
    && curl -L https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/latest/download/bgutil-ytdlp-pot-provider.zip -o ytdlp_plugins/bgutil-ytdlp-pot-provider.zip \
    && ls -la ytdlp_plugins/

# Garante criação e permissões dos diretórios de dados e sessão
RUN mkdir -p data sessao temp logs \
    && chown -R node:node /app

# Executa com usuário não-privilegiado para segurança
USER node

# Healthcheck interno
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node scripts/healthcheck.js || exit 1

EXPOSE 3000

CMD ["node", "src/index.js"]

