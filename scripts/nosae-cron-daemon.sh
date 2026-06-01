#!/bin/bash
# Nosae 自我改善 daemon
# 每天跑 4 次：06:10, 10:10, 14:10, 20:10 JST
# 背景執行：bash scripts/nosae-cron-daemon.sh &

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="/home/node/.openclaw/workspace/memory/nosae-self-improve-cron.log"

echo "Nosae Cron Daemon 啟動 $(TZ=Asia/Tokyo date)" >> "$LOG"

while true; do
  H=$(TZ=Asia/Tokyo date +%H%M)
  case "$H" in
    "0610"|"1010"|"1410"|"2010")
      echo "=== $(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M') JST 執行 ===" >> "$LOG"
      cd "$SCRIPT_DIR/.." && bash "$SCRIPT_DIR/nosae-self-improve.sh" >> "$LOG" 2>&1
      sleep 70
      ;;
    *)
      sleep 55
      ;;
  esac
done
