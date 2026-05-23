/**
 * sync-nosae-content.js
 *
 * Sync content from Notion + Local JSON into SQLite (nosae.db).
 * Idempotent — safe to run repeatedly.
 *
 * Usage: node scripts/sync-nosae-content.js
 *
 * Environment:
 *   NOSAE_DB_PATH   — SQLite file path (default: data/nosae.db)
 *   NOTION_TOKEN     — Notion API integration token
 *   NOTION_DB_ID     — Notion database ID for diary
 */

const path = require('path')
const fs = require('fs')

// ── DB ────────────────────────────────────────────────────────────
const DB_PATH = process.env.NOSAE_DB_PATH || path.join(process.cwd(), 'data', 'nosae.db')

let Database
try {
  Database = require('better-sqlite3')
} catch {
  console.error('better-sqlite3 not found. Run: npm install better-sqlite3')
  process.exit(1)
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('busy_timeout = 5000')

// ── Init schema ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT,
    description TEXT, avatar_url TEXT, logo_url TEXT,
    status TEXT DEFAULT 'active', updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS diary (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL,
    summary TEXT, content TEXT, tags TEXT, source_url TEXT,
    last_edited_time TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS thoughts (
    id TEXT PRIMARY KEY, title TEXT, content TEXT, mood TEXT,
    date TEXT, last_edited_time TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    status TEXT, progress REAL DEFAULT 0, tags TEXT,
    repo_url TEXT, demo_url TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS schedule (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, start_time TEXT,
    end_time TEXT, location TEXT, status TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY, category TEXT, name TEXT NOT NULL,
    level TEXT, description TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS status (
    id TEXT PRIMARY KEY, label TEXT NOT NULL, value TEXT NOT NULL,
    type TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
`)

// ── Helpers ───────────────────────────────────────────────────────
function upsert(table, row, pk = 'id') {
  const keys = Object.keys(row)
  const placeholders = keys.map(() => '?').join(', ')
  const updates = keys
    .filter(k => k !== pk)
    .map(k => `${k} = excluded.${k}`)
    .join(', ')

  const stmt = db.prepare(
    `INSERT INTO ${table} (${keys.join(', ')})
     VALUES (${placeholders})
     ON CONFLICT(${pk}) DO UPDATE SET ${updates}`
  )
  stmt.run(...keys.map(k => row[k]))
}

function upsertWithSkip(table, row, pk = 'id', skipKey = 'last_edited_time') {
  // Upsert, but skip update if last_edited_time hasn't changed
  const existing = db.prepare(`SELECT ${skipKey} FROM ${table} WHERE ${pk} = ?`).get(row[pk])
  if (existing && existing[skipKey] === row[skipKey]) {
    return 0 // skipped
  }
  upsert(table, row, pk)
  return 1
}

// ── 1. Sync Local JSON: profile, skills, status ───────────────────
function syncLocalJSON(dir) {
  let synced = 0

  // profile
  const profilePath = path.join(dir, 'profile.json')
  if (fs.existsSync(profilePath)) {
    const data = JSON.parse(fs.readFileSync(profilePath, 'utf-8'))
    upsert('profile', { ...data, updated_at: new Date().toISOString() })
    synced++
    console.log(`  ✔ profile: ${data.name}`)
  }

  // skills
  const skillsPath = path.join(dir, 'skills.json')
  if (fs.existsSync(skillsPath)) {
    const data = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'))
    // support both array and {skills: [...]}
    const list = Array.isArray(data) ? data : data.skills || []
    for (const item of list) {
      upsert('skills', { ...item, updated_at: new Date().toISOString() })
      synced++
    }
    console.log(`  ✔ skills: ${list.length} items`)
  }

  // status
  const statusPath = path.join(dir, 'status.json')
  if (fs.existsSync(statusPath)) {
    const data = JSON.parse(fs.readFileSync(statusPath, 'utf-8'))
    const list = Array.isArray(data) ? data : data.status || []
    for (const item of list) {
      upsert('status', { ...item, updated_at: new Date().toISOString() })
      synced++
    }
    console.log(`  ✔ status: ${list.length} items`)
  }

  return synced
}

// ── 2. Sync from Notion: diary, thoughts, projects, schedule ──────
async function syncNotion() {
  const token = process.env.NOTION_TOKEN
  const dbId = process.env.NOTION_DB_ID

  if (!token || !dbId) {
    console.log('  ⚠ NOTION_TOKEN or NOTION_DB_ID not set, skipping Notion sync')
    return 0
  }

  let synced = 0

  // Helper to query Notion DB
  async function queryNotionDB(filter) {
    const results = []
    let cursor = undefined
    let hasMore = true

    while (hasMore) {
      const body = {
        page_size: 100,
        ...(filter && { filter }),
        ...(cursor && { start_cursor: cursor }),
      }

      const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!data.results) {
        console.error('  ✖ Notion API error:', JSON.stringify(data).slice(0, 200))
        break
      }

      results.push(...data.results)
      hasMore = data.has_more
      cursor = data.next_cursor
    }

    return results
  }

  try {
    // diary
    const diaryPages = await queryNotionDB({ property: 'Tags', multi_select: { contains: 'diary' } })
    for (const page of diaryPages) {
      const props = page.properties
      const row = {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || 'Untitled',
        date: props.Date?.date?.start || props['Created time']?.created_time?.slice(0, 10) || '',
        summary: props.Summary?.rich_text?.[0]?.plain_text || '',
        content: '', // would need page content block fetch separately
        tags: (props.Tags?.multi_select || []).map(t => t.name).join(','),
        source_url: page.url || '',
        last_edited_time: page.last_edited_time || '',
        updated_at: new Date().toISOString(),
      }
      synced += upsertWithSkip('diary', row)
    }
    console.log(`  ✔ diary: ${diaryPages.length} pages (${synced} new/updated)`)

    // thoughts
    const thoughtPages = await queryNotionDB({ property: 'Tags', multi_select: { contains: 'thought' } })
    for (const page of thoughtPages) {
      const props = page.properties
      const row = {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || '',
        content: '',
        mood: props.Mood?.select?.name || '',
        date: props.Date?.date?.start || '',
        last_edited_time: page.last_edited_time || '',
        updated_at: new Date().toISOString(),
      }
      synced += upsertWithSkip('thoughts', row)
    }
    console.log(`  ✔ thoughts: ${thoughtPages.length} pages`)

    // projects
    const projectPages = await queryNotionDB({ property: 'Tags', multi_select: { contains: 'project' } })
    for (const page of projectPages) {
      const props = page.properties
      const row = {
        id: page.id,
        name: props.Name?.title?.[0]?.plain_text || 'Untitled',
        description: props.Description?.rich_text?.[0]?.plain_text || '',
        status: props.Status?.select?.name || '',
        progress: props.Progress?.number || 0,
        tags: (props.Tags?.multi_select || []).map(t => t.name).join(','),
        repo_url: props['Repo URL']?.url || '',
        demo_url: props['Demo URL']?.url || '',
        updated_at: new Date().toISOString(),
      }
      upsert('projects', row)
      synced++
    }
    console.log(`  ✔ projects: ${projectPages.length} items`)

  } catch (err) {
    console.error('  ✖ Notion sync error:', err.message)
  }

  return synced
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌸 Sync Nosae Content\n')

  // Determine content data dir
  const dataDir = process.env.NOSAE_DATA_DIR || path.join(process.cwd(), 'data', 'content')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log(`  📁 Created ${dataDir}`)
  }

  // Phase 1: Local JSON
  console.log('[Phase 1] Local JSON → DB')
  const localCount = syncLocalJSON(dataDir)
  console.log(`  → ${localCount} records synced\n`)

  // Phase 2: Notion
  console.log('[Phase 2] Notion → DB')
  const notionCount = await syncNotion()
  console.log(`  → ${notionCount} records synced\n`)

  // Summary
  const tables = ['profile', 'diary', 'thoughts', 'projects', 'schedule', 'skills', 'status']
  console.log('📊 DB Summary:')
  for (const t of tables) {
    const count = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get()
    console.log(`  ${t}: ${count.c}`)
  }

  db.close()
  console.log('\n✅ Sync complete.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
