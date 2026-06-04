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

TIMESTAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S KST')
MESSAGE=$(cat <<EOF
Pocket Base 문의 요청 테스트

구분: 자동 테스트
실행 시각: $TIMESTAMP
상태: 정상 전송 확인용 테스트 메시지
EOF
)

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${TELEGRAM_CHAT_ID}\",\"text\":\"${MESSAGE//$'\n'/\\n}\"}"
