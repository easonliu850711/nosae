#!/usr/bin/env node
/**
 * 將靜態日記資料同步至 SQLite DB
 * 從 data/ 讀取 diary_index.json + diary_YYYY-MM-DD.json 寫入 nosae.db
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.NOSAE_DB_PATH || path.join(process.cwd(), 'data', 'nosae.db')
const DATA_DIR = path.join(process.cwd(), 'public', 'data')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// 建立 schema（同 lib/schema.ts）
db.exec(`
  CREATE TABLE IF NOT EXISTS diary (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    date            TEXT NOT NULL,
    summary         TEXT,
    content         TEXT,
    tags            TEXT,
    source_url      TEXT,
    last_edited_time TEXT,
    updated_at      TEXT DEFAULT (datetime('now'))
  );
`)

// 讀取 index
const indexPath = path.join(DATA_DIR, 'diary_index.json')
if (!fs.existsSync(indexPath)) {
  console.error('❌ 找不到 diary_index.json')
  process.exit(1)
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
console.log(`📖 找到 ${index.length} 篇日記索引`)

const insert = db.prepare(`
  INSERT OR REPLACE INTO diary (id, title, date, summary, content, tags, last_edited_time)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

let count = 0
for (const entry of index) {
  const date = entry.date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue

  const contentPath = path.join(DATA_DIR, `diary_${date}.json`)
  if (!fs.existsSync(contentPath)) {
    console.log(`  ⚠️  ${date} — 無內容檔案，跳過`)
    continue
  }

  const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'))
  const title = content.title || entry.title || date
  const summary = content.summary || ''
  const entriesText = Array.isArray(content.entries)
    ? JSON.stringify(content.entries)
    : JSON.stringify([])
  const tags = content.tags || ''
  const lastEdited = content.last_edited_time || content.updated_at || null

  insert.run(date, title, date, summary, entriesText, tags, lastEdited)
  count++
}

console.log(`✅ 成功寫入 ${count} 篇日記到 SQLite`)
db.close()
