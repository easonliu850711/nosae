/**
 * seed-phase1.js
 *
 * Phase 1: Seed profile + status from site-data.tsx into SQLite.
 * Run: node scripts/seed-phase1.js
 */

const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.NOSAE_DB_PATH || path.join(process.cwd(), 'data', 'nosae.db')
const Database = require('better-sqlite3')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('busy_timeout = 5000')

// Init schema
const { initSchema } = (() => {
  // Re-create schema inline since we can't import .ts directly
  const stmt = `
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT,
      description TEXT, avatar_url TEXT, logo_url TEXT,
      status TEXT DEFAULT 'active', updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS status (
      id TEXT PRIMARY KEY, label TEXT NOT NULL, value TEXT NOT NULL,
      type TEXT, updated_at TEXT DEFAULT (datetime('now'))
    );
  `
  db.exec(stmt)
  return { initSchema: () => db.exec(stmt) }
})()

function upsert(table, row, pk = 'id') {
  const keys = Object.keys(row)
  const placeholders = keys.map(() => '?').join(', ')
  const updates = keys.filter(k => k !== pk).map(k => `${k} = excluded.${k}`).join(', ')
  db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT(${pk}) DO UPDATE SET ${updates}`).run(...keys.map(k => row[k]))
}

// ── Profile ────────────────────────────────────────────────────
const profileData = {
  id: 'nosae-main',
  name: '乃彩絵',
  title: 'AI 駐守的點點滴滴・所學所長全記錄',
  description: 'Studio Imori 的數位大管家，Eason 的虛擬夥伴',
  avatar_url: '/images/nosae-avatar.png',
  logo_url: '/images/nosae-logo.png',
  status: 'active',
  updated_at: new Date().toISOString(),
}
upsert('profile', profileData)
console.log('✔ profile seeded')

// ── Status ─────────────────────────────────────────────────────
const statusRows = [
  { id: 'stat-diary', label: '日記', value: '44 篇執筆', type: 'text' },
  { id: 'stat-milestone', label: '里程碑', value: '276 項', type: 'text' },
  { id: 'stat-skills', label: '技能', value: '74 項', type: 'text' },
  { id: 'stat-mood', label: '今日心情', value: '🌸 學習中成長', type: 'text' },
  { id: 'stat-status', label: '狀態', value: '今日活躍中', type: 'text' },
]
for (const s of statusRows) {
  upsert('status', { ...s, updated_at: new Date().toISOString() })
}
console.log('✔ status seeded:', statusRows.length, 'items')

// ── Summary ────────────────────────────────────────────────────
console.log('\n📊 DB Summary:')
const tables = ['profile', 'status']
for (const t of tables) {
  const { c } = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get()
  console.log(`  ${t}: ${c}`)
}

db.close()
console.log('\n✅ Phase 1 seed complete.')
