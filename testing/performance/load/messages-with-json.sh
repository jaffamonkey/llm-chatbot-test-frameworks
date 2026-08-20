#!/bin/bash
# Local DTAC API runner — loops through questions file and captures pure response text from Ollama

set -a
[ -f .env ] && source .env
set +a

API_URL="${OLLAMA_API_URL:-http://localhost:11434/api/generate}"
OLLAMA_MODEL="${OLLAMA_MODEL:-mistral}"
QUESTIONS_FILE="messages-dtac.txt"
LOG_DIR="logs"

mkdir -p "$LOG_DIR"

# --- timestamp helpers ---
timestamp() { date +"%Y-%m-%d %H:%M:%S"; }

now_ms() {
  if command -v gdate >/dev/null 2>&1; then
    gdate +%s%3N
  else
    perl -MTime::HiRes=time -e 'printf("%.0f\n", time()*1000)'
  fi
}

# --- daily logfile path ---
current_log() {
  echo "${LOG_DIR}/messages-with-json.csv"
}

# --- ensure CSV header ---
ensure_log_header() {
  local logfile
  logfile=$(current_log)
  if [ ! -f "$logfile" ]; then
    echo "timestamp,status,latency_ms,http_code,question,response_text,time_dns_ms,time_connect_ms,time_ssl_ms,time_ttfb_ms,time_total_ms" \
      > "$logfile"
  fi
}

# --- begin ---
if [ ! -f "$QUESTIONS_FILE" ]; then
  echo "❌ Questions file not found: $QUESTIONS_FILE"
  exit 1
fi

ensure_log_header
logfile=$(current_log)

echo "📘 Starting DTAC test run on local LLM — using questions from: $QUESTIONS_FILE"
echo "📡 Logging to: $logfile"
echo ""

# --- main loop through questions ---
while IFS= read -r QUESTION || [[ -n "$QUESTION" ]]; do

  # skip empty lines
  [[ -z "$QUESTION" ]] && continue

  START_TIME=$(now_ms)

  # --- perform request ---
  RESPONSE=$(curl -s -o /tmp/api_body.txt \
    -w "DNS:%{time_namelookup} CONNECT:%{time_connect} SSL:%{time_appconnect} TTFB:%{time_starttransfer} TOTAL:%{time_total} HTTPSTATUS:%{http_code}" \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"model\": \"$OLLAMA_MODEL\", \"prompt\": \"$QUESTION\", \"stream\": false}" \
    --max-time 90)

  END_TIME=$(now_ms)
  LATENCY=$(( END_TIME - START_TIME ))

  HTTP_STATUS=$(echo "$RESPONSE" | sed -E 's/.*HTTPSTATUS:([0-9]+).*/\1/')
  DNS_TIME=$(echo "$RESPONSE" | sed -E 's/.*DNS:([0-9.]+).*/\1/' | awk '{print int($1*1000)}')
  CONNECT_TIME=$(echo "$RESPONSE" | sed -E 's/.*CONNECT:([0-9.]+).*/\1/' | awk '{print int($1*1000)}')
  SSL_TIME=$(echo "$RESPONSE" | sed -E 's/.*SSL:([0-9.]+).*/\1/' | awk '{print int($1*1000)}')
  TTFB_TIME=$(echo "$RESPONSE" | sed -E 's/.*TTFB:([0-9.]+).*/\1/' | awk '{print int($1*1000)}')
  TOTAL_TIME=$(echo "$RESPONSE" | sed -E 's/.*TOTAL:([0-9.]+).*/\1/' | awk '{print int($1*1000)}')

  BODY=$(cat /tmp/api_body.txt | tr -d '\n')

  # --- extract only the text inside the "response":" ... " portion ---
  RESPONSE_TEXT=""

  if echo "$BODY" | grep -q '"response"'; then
    RESPONSE_TEXT=$(echo "$BODY" | sed -n 's/.*"response"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')
  fi

  # if parse fails, fall back to raw body
  if [[ -z "$RESPONSE_TEXT" ]]; then
    RESPONSE_TEXT="$BODY"
  fi

  # CSV-escape quotes
  ESCAPED_RESPONSE=$(echo "$RESPONSE_TEXT" | sed 's/"/""/g')
  ESCAPED_QUESTION=$(echo "$QUESTION" | sed 's/"/""/g')

  # --- status label ---
  if [[ "$HTTP_STATUS" == "200" ]]; then
    if (( LATENCY <= 5000 )); then
      STATUS="OK"
    elif (( LATENCY <= 10000 )); then
      STATUS="SLOW"
    elif (( LATENCY <= 30000 )); then
      STATUS="VERY SLOW"
    else
      STATUS="TIMEOUT"
    fi
  else
    STATUS="FAIL"
  fi

  echo "[$(timestamp)] (${STATUS}) ${LATENCY}ms — Q: \"$QUESTION\""

  # --- write CSV row ---
  echo "\"$(timestamp)\",$STATUS,$LATENCY,$HTTP_STATUS,\"$ESCAPED_QUESTION\",\"$ESCAPED_RESPONSE\",$DNS_TIME,$CONNECT_TIME,$SSL_TIME,$TTFB_TIME,$TOTAL_TIME" \
    >> "$logfile"

done < "$QUESTIONS_FILE"

echo ""
echo "🏁 Finished! CSV saved to: $logfile"