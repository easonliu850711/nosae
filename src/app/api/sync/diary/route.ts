import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATA_DIR = join(process.cwd(), 'public', 'data')

/**
 * POST /api/sync/diary
 *
 * 從外部接收日記內容，同步寫入 static JSON + SQLite
 * 讓網站無需 rebuild 即可更新日記資料
 *
 * Body:
 * {
 *   token: string          // 驗證用（對應環境變數 SYNC_TOKEN）
 *   date: string           // "2026-05-25"
 *   title: string          // 日記標題
 *   entries: object[]      // Notion-style entries 陣列
 * }
 */
export async function POST(request: Request) {
  const SYNC_TOKEN = process.env.SYNC_TOKEN

  // 如果沒設 SYNC_TOKEN，預設拒絕
  if (!SYNC_TOKEN) {
    return Response.json(
      { error: 'SYNC_TOKEN not configured on server' },
      { status: 500 }
    )
  }

  let body: {
    token?: string
    date?: string
    title?: string
    entries?: unknown[]
  }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  // ── 驗證 ──
  if (body.token !== SYNC_TOKEN) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { date, title, entries } = body
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'invalid or missing date (YYYY-MM-DD)' }, { status: 400 })
  }
  if (!title) {
    return Response.json({ error: 'missing title' }, { status: 400 })
  }
  if (!Array.isArray(entries)) {
    return Response.json({ error: 'entries must be an array' }, { status: 400 })
  }

  try {
    // 確保 data 目錄存在
    if (!existsSync(DATA_DIR)) {
      const { mkdirSync } = await import('fs')
      mkdirSync(DATA_DIR, { recursive: true })
    }

    // ── 1. 寫入靜態 JSON ──
    const diaryFile = join(DATA_DIR, `diary_${date}.json`)
    writeFileSync(diaryFile, JSON.stringify({ date, title, entries }, null, 2), 'utf-8')

    // ── 2. 更新 diary_index.json ──
    const indexPath = join(DATA_DIR, 'diary_index.json')
    let index: { date: string; title: string }[] = []
    if (existsSync(indexPath)) {
      try {
        const raw = readFileSync(indexPath, 'utf-8')
        // 去除 BOM
        const clean = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
        index = JSON.parse(clean)
      } catch {
        index = []
      }
    }

    // 移除舊的同一日期條目（如果有），再加入新的
    index = index.filter((e: { date: string }) => e.date !== date)
    index.push({ date, title })
    // 依日期降序排列
    index.sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date))
    writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')

    // ── 3. 寫入 SQLite ──
    // 把 content → text 統一格式，讓前端 diary/page.tsx 的 block.text 能正確讀取
    const normalizedEntries = entries.map((e: any) => ({
      type: e.type || 'text',
      text: e.text || e.content || '',
    }))
    initSchema()
    const db = getDb()
    const entriesText = JSON.stringify(normalizedEntries)
    db.prepare(
      `INSERT OR REPLACE INTO diary (id, title, date, content, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).run(date, title, date, entriesText)

    return Response.json({
      success: true,
      date,
      title,
      entriesCount: entries.length,
      totalInIndex: index.length,
    })
  } catch (err) {
    console.error('[sync/diary] error:', err)
    return Response.json(
      { error: 'internal server error', detail: String(err) },
      { status: 500 }
    )
  }
}
