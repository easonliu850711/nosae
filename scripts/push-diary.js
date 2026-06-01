#!/usr/bin/env node
/**
 * 將本地日記檔案同步到台灣主機的 Nosae 站
 *
 * 用法:
 *   node scripts/push-diary.js 2026-05-25
 *
 * 必要環境變數:
 *   SYNC_TOKEN
 *
 * 可選環境變數:
 *   NOSAE_SYNC_URL
 */

const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.NOSAE_SYNC_URL || 'https://nosae.studio-imori.com/api/sync/diary'
const SYNC_TOKEN = process.env.SYNC_TOKEN

if (!SYNC_TOKEN) {
  console.error('❌ 需要設定環境變數 SYNC_TOKEN')
  console.error('PowerShell 範例：')
  console.error('  $env:SYNC_TOKEN="nosae-apikey-202605"')
  process.exit(1)
}

const date = process.argv[2]
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('❌ 請提供日期參數: node scripts/push-diary.js 2026-05-25')
  process.exit(1)
}

const diaryFile = path.join(__dirname, '..', 'public', 'data', `diary_${date}.json`)
if (!fs.existsSync(diaryFile)) {
  console.error(`❌ 找不到日記檔案: ${diaryFile}`)
  process.exit(1)
}

let diary
try {
  diary = JSON.parse(fs.readFileSync(diaryFile, 'utf-8'))
} catch (err) {
  console.error(`❌ 日記 JSON 解析失敗: ${err.message}`)
  process.exit(1)
}

const payload = {
  token: SYNC_TOKEN,
  date: diary.date || date,
  title: diary.title || `乃彩絵日記 - ${date}`,
  entries: Array.isArray(diary.entries) ? diary.entries : (Array.isArray(diary.content) ? diary.content : []),
}

console.log(`📤 正在推送 ${date} 日記到 ${BASE_URL} ...`)

fetch(BASE_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SYNC_TOKEN}`,
    'User-Agent': 'Studio-Imori-Nosae-Diary-Sync/1.0',
  },
  body: JSON.stringify(payload),
})
  .then(async res => {
    const text = await res.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch {}

    if (!res.ok) {
      console.error(`❌ 同步失敗 HTTP ${res.status} ${res.statusText}`)
      if (data) {
        console.error(JSON.stringify(data, null, 2))
      } else {
        console.error(text.slice(0, 1000))
      }

      if (res.status === 403) {
        console.error('')
        console.error('判斷：403 通常不是 Next.js route.ts 回的，而是 Cloudflare / Nginx / Access / WAF 在進入程式前擋掉。')
        console.error('請先在台灣主機本機測：http://127.0.0.1:3003/api/sync/diary')
      }

      process.exit(1)
    }

    if (data?.success) {
      console.log(`✅ 同步成功！(${data.entriesCount} 個段落，索引共 ${data.totalInIndex} 篇)`)
    } else {
      console.error('❌ API 回應不是 success=true：')
      console.error(data ? JSON.stringify(data, null, 2) : text)
      process.exit(1)
    }
  })
  .catch(err => {
    console.error(`❌ 連線失敗:`, err.message)
    process.exit(1)
  })
