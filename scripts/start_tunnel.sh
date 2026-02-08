#!/usr/bin/env bash
# Supervisory script to keep localtunnel running for localhost:3006
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
LOG_DIR="$SCRIPT_DIR/../var"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/localtunnel.log"

echo "[start_tunnel] starting supervisor, log: $LOG"
while true; do
  echo "[start_tunnel] starting localtunnel at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$LOG"
  # Use npx --yes so it runs without a global install
  npx --yes localtunnel --port 3006 --print-requests >> "$LOG" 2>&1 || true
  echo "[start_tunnel] localtunnel exited at $(date -u +'%Y-%m-%dT%H:%M:%SZ'), restarting in 2s" >> "$LOG"
  sleep 2
done
