#!/bin/zsh

set -eu

WORKDIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$WORKDIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing .env.local"
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "Missing TELEGRAM_BOT_TOKEN"
  exit 1
fi

if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "Missing TELEGRAM_CHAT_ID"
  exit 1
fi

SITE_BASE_URL="${SITE_BASE_URL:-https://pocket-base-lac.vercel.app}"
TIMESTAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S KST')
PAYLOAD=$(cat <<EOF
{"name":"자동 테스트","phone":"010-0000-0000","email":"test@pocketbase.local","message":"문의 요청 자동 테스트입니다. 실행 시각: $TIMESTAMP"}
EOF
)

curl -s -X POST "${SITE_BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
