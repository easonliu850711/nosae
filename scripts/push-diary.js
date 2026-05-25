#!/usr/bin/env node
/**
 * 將本地日記檔案同步到台灣主機的 Nosae 站
 *
 * 用法: node scripts/push-diary.js <date>
 * 範例: node scripts/push-diary.js 2026-05-25
 */

const BASE_URL = process.env.NOSAE_SYNC_URL || 'https://nosae.studio-imori.com/api/sync/diary'
const SYNC_TOKEN = process.env.SYNC_TOKEN

if (!SYNC_TOKEN) {
  console.error('❌ 需要設定環境變數 SYNC_TOKEN')
  console.error('   export SYNC_TOKEN=your-token')
  process.exit(1)
}

const date = process.argv[2]
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('❌ 請提供日期參數: node scripts/push-diary.js 2026-05-25')
  process.exit(1)
}

const fs = require('fs')
const path = require('path')

const diaryFile = path.join(__dirname, '..', 'public', 'data', `diary_${date}.json`)
if (!fs.existsSync(diaryFile)) {
  console.error(`❌ 找不到日記檔案: ${diaryFile}`)
  process.exit(1)
}

const diary = JSON.parse(fs.readFileSync(diaryFile, 'utf-8'))

console.log(`📤 正在推送 ${date} 日記到 ${BASE_URL} ...`)

fetch(BASE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: SYNC_TOKEN,
    date: diary.date || date,
    title: diary.title || date,
    entries: diary.entries || [],
  }),
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log(`✅ 同步成功！(${data.entriesCount} 個段落，索引共 ${data.totalInIndex} 篇)`)
    } else {
      console.error(`❌ 同步失敗:`, data.error || JSON.stringify(data))
    }
  })
  .catch(err => {
    console.error(`❌ 連線失敗:`, err.message)
  })
