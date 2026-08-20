#!/bin/bash
# dtac-runner.sh — bulletproof edition for local Ollama
# Reads messages from file, sends one-by-one, extracts only the "response" JSON value safely.

set -a
[ -f .env ] && source .env
set +a

API_URL="${OLLAMA_API_URL:-http://localhost:11434/api/generate}"
OLLAMA_MODEL="${OLLAMA_MODEL:-mistral}"
LOG_DIR="logs"
MESSAGES_FILE="messages-dtac.txt"
MAX_TIME=90

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }

mkdir -p "$LOG_DIR"

now_ms() {
  if command -v gdate >/dev/null 2>&1; then
    gdate +%s%3N
  else
    perl -MTime::HiRes=time -e 'printf("%.0f\n", time()*1000)'
  fi
}

current_log() {
  echo "${LOG_DIR}/messages-without-json.csv"
}

ensure_log_header() {
  local logfile=$(current_log)
  if [ ! -f "$logfile" ]; then
    echo "timestamp,status,latency_ms,http_code,question,response_text,dns_ms,connect_ms,ssl_ms,ttfb_ms,total_ms" \
      > "$logfile"
  fi
}

# Ensure header BEFORE first write
ensure_log_header

echo "📄 Reading messages from: $MESSAGES_FILE"
if [[ ! -f "$MESSAGES_FILE" ]]; then
  echo "❌ Error: message file not found."
  exit 1
fi

echo "🚦 Running tests against local LLM…"

while IFS= read -r MESSAGE || [[ -n "$MESSAGE" ]]; do
    
  [[ -z "$MESSAGE" ]] && continue

  ensure_log_header
  logfile=$(current_log)

  echo
  echo "💬 Sending: \"$MESSAGE\""

  START=$(now_ms)

  RESPONSE_RAW=$(curl -s -o /tmp/api_body.txt \
    -w "DNS:%{time_namelookup} CONNECT:%{time_connect} SSL:%{time_appconnect} \
        TTFB:%{time_starttransfer} TOTAL:%{time_total} HTTPSTATUS:%{http_code}" \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"model\": \"$OLLAMA_MODEL\", \"prompt\": \"$MESSAGE\", \"stream\": false}" \
    --max-time "$MAX_TIME")

  END=$(now_ms)
  LATENCY=$(( END - START ))

  RAW_BODY=$(cat /tmp/api_body.txt)

  #
  #  BULLETPROOF RESPONSE EXTRACTION
  #  Extract ONLY the exact text inside "response": " ... "
  #
  RESPONSE_TEXT=$(
    printf "%s" "$RAW_BODY" \
    | perl -0777 -ne '
        if (/\"response\"\s*:\s*\"(.*?)\"/s) {
            $t = $1;
            # Clean escaped newlines and tabs
            $t =~ s/\\n/ /g;
            $t =~ s/\\r/ /g;
            $t =~ s/\\t/ /g;
            # Collapse spaces
            $t =~ s/\s+/ /g;
            print $t;
        }'
  )

  # If nothing extracted, fallback to raw body
  [[ -z "$RESPONSE_TEXT" ]] && RESPONSE_TEXT="$RAW_BODY"

  # Escape quotes for CSV
  RESPONSE_CSV=$(echo "$RESPONSE_TEXT" | sed 's/"/""/g')
  QUESTION_CSV=$(echo "$MESSAGE" | sed 's/"/""/g')

  HTTP_STATUS=$(echo "$RESPONSE_RAW" | sed -E 's/.*HTTPSTATUS:([0-9]+).*/\1/')
  DNS=$(echo "$RESPONSE_RAW" | sed -E 's/.*DNS:([0-9.]+).*/\1/' | awk '{printf "%d", $1*1000}')
  CONNECT=$(echo "$RESPONSE_RAW" | sed -E 's/.*CONNECT:([0-9.]+).*/\1/' | awk '{printf "%d", $1*1000}')
  SSL=$(echo "$RESPONSE_RAW" | sed -E 's/.*SSL:([0-9.]+).*/\1/' | awk '{printf "%d", $1*1000}')
  TTFB=$(echo "$RESPONSE_RAW" | sed -E 's/.*TTFB:([0-9.]+).*/\1/' | awk '{printf "%d", $1*1000}')
  TOTAL=$(echo "$RESPONSE_RAW" | sed -E 's/.*TOTAL:([0-9.]+).*/\1/' | awk '{printf "%d", $1*1000}')

  if [[ "$HTTP_STATUS" == "200" ]]; then
    if (( LATENCY <= 5000 )); then STATUS="OK"
    elif (( LATENCY <= 10000 )); then STATUS="SLOW"
    elif (( LATENCY <= 30000 )); then STATUS="VERY SLOW"
    else STATUS="TIMEOUT"
    fi
    echo "[$(timestamp)] ✅ $STATUS (${LATENCY}ms) | HTTP $HTTP_STATUS"
  else
    STATUS="FAIL"
    echo "[$(timestamp)] ❌ FAIL (${LATENCY}ms) | HTTP $HTTP_STATUS"
  fi

  echo "\"$(timestamp)\",\"$STATUS\",\"$LATENCY\",\"$HTTP_STATUS\",\"$QUESTION_CSV\",\"$RESPONSE_CSV\",\"$DNS\",\"$CONNECT\",\"$SSL\",\"$TTFB\",\"$TOTAL\"" \
    >> "$logfile"

done < "$MESSAGES_FILE"

echo
echo "🏁 Finished — reached end of message file."
exit 0