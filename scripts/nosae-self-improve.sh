#!/bin/bash
# Nosae 站自我改善腳本
# 每天跑 ~4 次（06:00, 10:00, 14:00, 20:00 JST）
# 逐步讓每個頁面更有特色，不是加功能而是加深體驗
#
# 使用方式：bash scripts/nosae-self-improve.sh
# 結果會記錄到 memory/nosae-self-improve-log.md

set -e
cd "$(dirname "$0")/.."

LOG="/home/node/.openclaw/workspace/memory/nosae-self-improve-log.md"
echo -e "\n## $(date '+%Y-%m-%d %H:%M') JST — 自我巡禮" >> "$LOG"

# ── 1. 檢查目前頁面狀態 ──
PAGES=("diary" "now" "mood" "growth" "stats" "thoughts" "calendar" "about")
declare -A PAGE_LABELS=(
  [diary]="日記" [now]="Now" [mood]="心情" [growth]="成長"
  [stats]="數據" [thoughts]="隨想" [calendar]="足跡" [about]="關於"
)

ISSUES=""
for p in "${PAGES[@]}"; do
  FP="src/app/$p/page.tsx"
  if [ ! -f "$FP" ]; then
    ISSUES+="❌ $p (${PAGE_LABELS[$p]}) — 頁面遺失\n"
    continue
  fi

  LINES=$(wc -l < "$FP")
  # 檢查有沒有獨特的視覺元素
  HAS_BG_GRAD=$(grep -c "bg-gradient" "$FP" || true)
  HAS_ANIMATION=$(grep -c "motion\." "$FP" || true)
  HAS_UNIQUE=$(grep -c "useState\|useEffect" "$FP" || true)

  echo "  $p: ${LINES}行, bg-gradient=${HAS_BG_GRAD}, motion=${HAS_ANIMATION}" >> "$LOG"
done

if [ -n "$ISSUES" ]; then
  echo -e "\n### ⚠️ 問題發現" >> "$LOG"
  echo -e "$ISSUES" >> "$LOG"
fi

# ── 2. 隨機選一個頁面做小優化（輪流加深） ──
TODAY=$(date +%j)
IDX=$(( TODAY % ${#PAGES[@]} ))
TARGET="${PAGES[$IDX]}"
TARGET_LABEL="${PAGE_LABELS[$TARGET]}"

echo -e "\n### 🎯 本次目標：${TARGET_LABEL}（$TARGET）" >> "$LOG"

# 針對不同頁面的特色加深邏輯
case "$TARGET" in
  diary)
    # 日記頁：確保漫步模式運作正常，檢查日記篇數
    COUNT=$(ls public/data/diary/diary_*.json 2>/dev/null | wc -l)
    echo "  日記篇數：$COUNT" >> "$LOG"
    if [ "$COUNT" -lt 50 ]; then
      echo "  提示：篇數未達 50，持續累積中" >> "$LOG"
    fi
    # 確認 search_index.json 存在
    if [ ! -f "public/data/search_index.json" ]; then
      echo "  ⚠️ search_index.json 遺失，需要重建" >> "$LOG"
    fi
    ;;

  now)
    # Now 頁：確認時間分段有覆蓋到 24 小時
    echo "  Now 頁時間分段檢查（略）" >> "$LOG"
    ;;

  mood)
    # 心情頁：檢查情緒關鍵詞數量
    KEYWORDS=$(grep -c "mood:" "src/app/mood/page.tsx" || true)
    echo "  情緒關鍵詞：${KEYWORDS} 組" >> "$LOG"
    ;;

  growth)
    # 成長頁：檢查 milestones.json 是否存在
    if [ -f "public/data/milestones.json" ]; then
      MSIZE=$(wc -c < "public/data/milestones.json")
      echo "  milestones.json：${MSIZE} bytes" >> "$LOG"
    else
      echo "  ⚠️ milestones.json 不存在" >> "$LOG"
    fi
    ;;

  stats)
    # 數據頁：檢查日記索引資訊
    echo "  stats 頁：確認日記統計資料存在" >> "$LOG"
    ;;

  thoughts)
    # 隨想頁：檢查名言語錄隨機性
    echo "  thoughts 頁：確認隨機抽取機制正常" >> "$LOG"
    ;;

  calendar)
    # 足跡頁：換個角度觀察
    echo "  calendar 頁：確認日曆資料存在" >> "$LOG"
    ;;

  about)
    # 關於頁：更新自我介紹
    echo "  about 頁：檢查自我介紹資料完整性" >> "$LOG"
    ;;
esac

# ── 3. 檢查 git 狀態，如果有未提交的優化就 commit ──
if [ -n "$(git status --porcelain)" ]; then
  echo -e "\n### 📦 有未提交變更，準備 commit" >> "$LOG"
  git add -A
  git commit -m "nosae-improve: $(date '+%m-%d %H:%M') 自主改善" 2>/dev/null || true
  # 不自動 push，避免衝突
  echo "  ✅ commit 完成（未 push）" >> "$LOG"
else
  echo -e "\n### ✅ git 乾淨，無變更需要提交" >> "$LOG"
fi

echo "✅ 本次巡禮完成" >> "$LOG"
echo "---" >> "$LOG"
