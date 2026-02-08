#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
LOG_DIR="$SCRIPT_DIR/../var"
mkdir -p "$LOG_DIR"
MON_LOG="$LOG_DIR/monitor.log"
LT_LOG="$LOG_DIR/localtunnel.log"

echo "[monitor] starting at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$MON_LOG"

# restart policy: allow a number of restarts within a time window, with exponential backoff
MAX_RESTARTS=6
RESTART_WINDOW=300 # seconds
restart_times=()

restart_supervisor() {
  now=$(date +%s)
  # drop old entries
  new_times=()
  for t in "${restart_times[@]:-}"; do
    if [ $((now - t)) -le $RESTART_WINDOW ]; then
      new_times+=("$t")
    fi
  done
  restart_times=("${new_times[@]}")

  restart_times+=("$now")
  attempts=${#restart_times[@]}

  if [ $attempts -gt $MAX_RESTARTS ]; then
    echo "[monitor] restart limit exceeded ($attempts in ${RESTART_WINDOW}s), backing off" >> "$MON_LOG"
    backoff=$((60))
    echo "[monitor] sleeping ${backoff}s before next attempt" >> "$MON_LOG"
    sleep $backoff
    return
  fi

  # exponential backoff based on attempts (cap to 300s)
  backoff=$((2 ** (attempts - 1)))
  if [ $backoff -gt 300 ]; then
    backoff=300
  fi

  echo "[monitor] restarting localtunnel supervisor at $(date -u +'%Y-%m-%dT%H:%M:%SZ') (attempt $attempts, backoff ${backoff}s)" >> "$MON_LOG"
  pkill -f start_tunnel.sh || true
  sleep 1
  nohup bash "$SCRIPT_DIR/start_tunnel.sh" > /dev/null 2>&1 &
  echo "[monitor] restarted supervisor, pid=$!" >> "$MON_LOG"
  sleep $backoff
}

no_url_wait=2

while true; do
  URL_LINE=$(grep -m1 'your url is:' "$LT_LOG" || true)
  if [ -z "$URL_LINE" ]; then
    echo "[monitor] no public URL yet, waiting ${no_url_wait}s..." >> "$MON_LOG"
    sleep $no_url_wait
    # gradually increase wait to avoid hot-loop
    if [ $no_url_wait -lt 30 ]; then
      no_url_wait=$((no_url_wait * 2))
    fi
    continue
  fi

  PUBLIC_URL=$(echo "$URL_LINE" | awk '{print $4}')
  echo "[monitor] checking $PUBLIC_URL at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$MON_LOG"
  # Fetch headers
  HTTP_OUTPUT=$(curl -sSI --max-time 8 "$PUBLIC_URL" 2>&1 || true)
  echo "$HTTP_OUTPUT" >> "$MON_LOG"

  if echo "$HTTP_OUTPUT" | grep -qi 'x-localtunnel-status: Tunnel Unavailable' || echo "$HTTP_OUTPUT" | grep -q 'HTTP/1.1 503'; then
    echo "[monitor] detected tunnel unavailable, restarting supervisor" >> "$MON_LOG"
    restart_supervisor
    continue
  fi

  if echo "$HTTP_OUTPUT" | grep -qi 'HTTP/1.1 200'; then
    echo "[monitor] public URL healthy" >> "$MON_LOG"
    # reset restart history on success to allow quicker recovery later
    restart_times=()
  else
    echo "[monitor] public URL returned unexpected response, will retry" >> "$MON_LOG"
  fi

  sleep 10
done
