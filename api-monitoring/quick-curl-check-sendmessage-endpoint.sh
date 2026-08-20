#!/bin/bash
# quick-curl-check-sendmessage-endpoint.sh
# Periodically pings the local Ollama API endpoint and logs detailed timings.

set -a
[ -f .env ] && source .env
set +a

API_URL="${OLLAMA_API_URL:-http://localhost:11434/api/generate}"
OLLAMA_MODEL="${OLLAMA_MODEL:-mistral}"
LOG_DIR="logs"
MESSAGE="ping"
INTERVAL=10 # seconds between pings

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }

mkdir -p "$LOG_DIR"

# --- cross-platform high-precision timestamp in ms ---
now_ms() {
  if command -v gdate >/dev/null 2>&1; then
    gdate +%s%3N
  else
    perl -MTime::HiRes=time -e 'printf("%.0f\n", time()*1000)'
  fi
}

# --- daily log file rotation ---
current_log() {
  echo "${LOG_DIR}/api_ping_$(date +%Y-%m-%d).csv"
}

ensure_log_header() {
  local logfile
  logfile=$(current_log)
  if [ ! -f "$logfile" ]; then
    echo "timestamp,status,latency_ms,http_code,error,time_dns_ms,time_connect_ms,time_ssl_ms,time_ttfb_ms,time_total_ms" > "$logfile"
  fi
}

echo "🚦 Starting API ping loop — hitting $API_URL every ${INTERVAL}s"

while true; do
  ensure_log_header
  logfile=$(current_log)

  START_TIME=$(now_ms)

  # Perform request and extract timings
  RESPONSE=$(curl -s -o /tmp/api_body.txt -w "DNS:%{time_namelookup} CONNECT:%{time_connect} SSL:%{time_appconnect} TTFB:%{time_starttransfer} TOTAL:%{time_total} HTTPSTATUS:%{http_code}" \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"model\": \"$OLLAMA_MODEL\", \"prompt\": \"$MESSAGE\", \"stream\": false}" \
    --max-time 90)

  END_TIME=$(now_ms)
  LATENCY=$(( END_TIME - START_TIME ))

  BODY=$(cat /tmp/api_body.txt | tr -d '\n' | sed 's/"/""/g')
  HTTP_STATUS=$(echo "$RESPONSE" | sed -E 's/.*HTTPSTATUS:([0-9]+).*/\1/')
  DNS_TIME=$(echo "$RESPONSE" | sed -E 's/.*DNS:([0-9.]+).*/\1/' | awk '{print int($1 * 1000)}')
  CONNECT_TIME=$(echo "$RESPONSE" | sed -E 's/.*CONNECT:([0-9.]+).*/\1/' | awk '{print int($1 * 1000)}')
  SSL_TIME=$(echo "$RESPONSE" | sed -E 's/.*SSL:([0-9.]+).*/\1/' | awk '{print int($1 * 1000)}')
  TTFB_TIME=$(echo "$RESPONSE" | sed -E 's/.*TTFB:([0-9.]+).*/\1/' | awk '{print int($1 * 1000)}')
  TOTAL_TIME=$(echo "$RESPONSE" | sed -E 's/.*TOTAL:([0-9.]+).*/\1/' | awk '{print int($1 * 1000)}')

  # --- status logic ---
  if [[ "$HTTP_STATUS" == "200" ]]; then
    if (( LATENCY <= 5000 )); then
      SYMBOL="✅"; STATUS="OK"
    elif (( LATENCY <= 10000 )); then
      SYMBOL="⚠️"; STATUS="SLOW"
    elif (( LATENCY <= 30000 )); then
      SYMBOL="⚠️"; STATUS="VERY SLOW"
    else
      SYMBOL="❌"; STATUS="TIMEOUT"
    fi
    echo "[$(timestamp)] $SYMBOL ${STATUS} (${LATENCY}ms) [HTTP $HTTP_STATUS] | DNS:${DNS_TIME}ms CONNECT:${CONNECT_TIME}ms SSL:${SSL_TIME}ms TTFB:${TTFB_TIME}ms TOTAL:${TOTAL_TIME}ms"
    echo "$(timestamp),$STATUS,$LATENCY,$HTTP_STATUS,,$DNS_TIME,$CONNECT_TIME,$SSL_TIME,$TTFB_TIME,$TOTAL_TIME" >> "$logfile"
  else
    SYMBOL="❌"; STATUS="FAIL"
    echo "[$(timestamp)] $SYMBOL Error (${LATENCY}ms) [HTTP $HTTP_STATUS]"
    echo "$(timestamp),$STATUS,$LATENCY,$HTTP_STATUS,\"${BODY:0:200}\",$DNS_TIME,$CONNECT_TIME,$SSL_TIME,$TTFB_TIME,$TOTAL_TIME" >> "$logfile"
  fi

  sleep "$INTERVAL"
done