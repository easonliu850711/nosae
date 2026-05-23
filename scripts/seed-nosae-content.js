/**
 * seed-nosae-content.js
 *
 * Seed initial content from existing data files into SQLite.
 * Run once after first sync setup.
 *
 * Usage: node scripts/seed-nosae-content.js
 */

const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.NOSAE_DB_PATH || path.join(process.cwd(), 'data', 'nosae.db')
const Database = require('better-sqlite3')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('busy_timeout = 5000')

// Init schema
require(path.join(process.cwd(), 'scripts', 'sync-nosae-content.js'))

function upsert(table, row, pk = 'id') {
  const keys = Object.keys(row)
  const placeholders = keys.map(() => '?').join(', ')
  const updates = keys.filter(k => k !== pk).map(k => `${k} = excluded.${k}`).join(', ')
  db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT(${pk}) DO UPDATE SET ${updates}`).run(...keys.map(k => row[k]))
}

let total = 0

// ── Profile ─────────────────────────────────────────────────────
console.log('🌸 Seeding profile...')
upsert('profile', {
  id: 'nosae-main',
  name: '乃彩絵',
  title: 'AI 駐守的點點滴滴・所學所長全記錄',
  description: 'Studio Imori 的數位大管家，Eason 的虛擬夥伴',
  avatar_url: '/images/nosae-avatar.png',
  logo_url: '/images/nosae-logo.png',
  status: 'active',
  updated_at: new Date().toISOString(),
})
total++

// ── Status ─────────────────────────────────────────────────────
console.log('🌸 Seeding status...')
const statuses = [
  { id: 'status-1', label: '狀態', value: '今日活躍中', type: 'text' },
  { id: 'status-2', label: '日記', value: '44 篇', type: 'text' },
  { id: 'status-3', label: '里程碑', value: '276 項', type: 'text' },
  { id: 'status-4', label: '技能', value: '74 項', type: 'text' },
]
for (const s of statuses) {
  upsert('status', { ...s, updated_at: new Date().toISOString() })
  total++
}

// ── Diary from existing JSON data ───────────────────────────────
console.log('🌸 Seeding diary...')
const diaryDataPath = path.join(process.cwd(), 'data', 'diaries.json')
if (fs.existsSync(diaryDataPath)) {
  const diaries = JSON.parse(fs.readFileSync(diaryDataPath, 'utf-8'))
  const list = Array.isArray(diaries) ? diaries : diaries.diaries || diaries.data || []
  for (const d of list) {
    upsert('diary', {
      id: d.id || `seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: d.title || 'Untitled',
      date: d.date || d.created_at?.slice(0, 10) || '',
      summary: d.summary || d.content?.slice(0, 200) || '',
      content: d.content || '',
      tags: Array.isArray(d.tags) ? d.tags.join(',') : (d.tags || ''),
      source_url: d.source_url || d.url || '',
      last_edited_time: d.last_edited_time || d.updated_at || '',
      updated_at: new Date().toISOString(),
    })
    total++
  }
  console.log(`  → ${list.length} diaries`)
} else {
  console.log('  ⚠ No diaries.json found at data/diaries.json')
}

// ── Summary ────────────────────────────────────────────────────
console.log('\n📊 DB Summary:')
const tables = ['profile', 'diary', 'thoughts', 'projects', 'schedule', 'skills', 'status']
for (const t of tables) {
  const { c } = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get()
  console.log(`  ${t}: ${c}`)
}

db.close()
console.log(`\n✅ Seed complete. ${total} records total.`)
