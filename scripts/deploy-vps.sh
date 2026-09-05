#!/usr/bin/env bash
# ==========================================
# 🚀 MELIODAS BOT XP — DEPLOY NA VPS (git pull + rebuild Docker, SEM rsync)
# ==========================================
#
# Faz o deploy da VPS puxando o código do GitHub e reconstruindo a imagem Docker.
# Não depende de rsync (o Git Bash do Windows não tem). A sessão do WhatsApp e o
# banco continuam nos volumes Docker — não precisa re-parear.
#
# Uso:
#   ./scripts/deploy-vps.sh [alvo-ssh] [--push]
#     alvo-ssh : host/alias do SSH (padrão: "vps", definido no ~/.ssh/config)
#     --push   : faz `git push origin main` do seu PC ANTES de deployar
#
# Exemplos:
#   ./scripts/deploy-vps.sh                 # deploy usando o alias "vps"
#   ./scripts/deploy-vps.sh --push          # empurra o main local e deploya
#   ./scripts/deploy-vps.sh root@179.198.117.134 --push
#
set -euo pipefail

TARGET="vps"
DO_PUSH=0
for arg in "$@"; do
    case "$arg" in
        --push) DO_PUSH=1 ;;
        -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) TARGET="$arg" ;;
    esac
done

echo "=================================================="
echo "🚀 Deploy MeliodasBotXP → $TARGET"
echo "=================================================="

if [ "$DO_PUSH" = "1" ]; then
    echo "⬆️  Enviando main local para o GitHub…"
    git push origin main
fi

# Bloco executado NA VPS. Heredoc com aspas ('REMOTE') = enviado literalmente
# (nada é expandido localmente); tudo aqui roda no shell da VPS.
ssh "$TARGET" 'bash -s' <<'REMOTE'
set -euo pipefail
REMOTE_DIR="/var/www/meliodasbotxp"
SERVICE="meliodas-bot"
CONTAINER="meliodas_bot_xp"

cd "$REMOTE_DIR"

echo "📥 git fetch origin main…"
git fetch --quiet origin main
LOCAL=$(git rev-parse HEAD)
UPSTREAM=$(git rev-parse origin/main)

if [ "$LOCAL" = "$UPSTREAM" ]; then
    echo "ℹ️  Já em $(git log --oneline -1). Rebuild mesmo assim (assets/deps)."
else
    echo "🔀 Atualizando $(git rev-parse --short HEAD) → $(git rev-parse --short origin/main)…"
    # Tenta fast-forward. Se arquivos NÃO versionados na VPS conflitarem com os
    # que estão chegando, move-os para um backup em /tmp e refaz o merge.
    if ! OUT=$(git merge --ff-only origin/main 2>&1); then
        echo "$OUT"
        CONFLICTS=$(printf '%s\n' "$OUT" | sed -n 's/^\t//p')
        if [ -n "$CONFLICTS" ]; then
            BK="/tmp/meliodas_deploy_backup_$(date +%s)"
            mkdir -p "$BK"
            echo "🗃️  Backup de arquivos não versionados em conflito → $BK"
            while IFS= read -r f; do
                [ -n "$f" ] || continue
                if [ -e "$f" ]; then
                    mkdir -p "$BK/$(dirname "$f")"
                    mv "$f" "$BK/$f"
                    echo "   • $f"
                fi
            done <<< "$CONFLICTS"
            git merge --ff-only origin/main
        else
            echo "❌ Falha no merge (não foi conflito de arquivo não versionado). Abortando."
            exit 1
        fi
    fi
fi
echo "✅ HEAD: $(git log --oneline -1)"

echo "🐳 docker compose up -d --build $SERVICE…"
docker compose up -d --build "$SERVICE"

echo "⏳ Aguardando healthcheck…"
HEALTHY=0
for _ in $(seq 1 25); do
    H=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo unknown)
    S=$(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo unknown)
    if [ "$H" = "healthy" ]; then HEALTHY=1; echo "💚 Container healthy."; break; fi
    if [ "$S" = "exited" ] || [ "$S" = "dead" ]; then
        echo "❌ Container em status '$S'. Últimos logs:"
        docker logs --tail 30 "$CONTAINER" 2>&1 | tail -30
        exit 1
    fi
    sleep 3
done
[ "$HEALTHY" = "1" ] || echo "⚠️  Não ficou 'healthy' no tempo esperado — veja os logs abaixo."

echo "📄 Últimos logs do bot:"
docker logs --tail 15 "$CONTAINER" 2>&1 | tail -15
echo "=================================================="
echo "🎉 Deploy concluído."
echo "   Logs ao vivo:  ssh $HOSTNAME 'docker logs -f $CONTAINER'"
echo "=================================================="
REMOTE
