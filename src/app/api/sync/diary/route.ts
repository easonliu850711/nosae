import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATA_DIR = join(process.cwd(), 'public', 'data')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers || {}),
    },
  })
}

function getBearerToken(request: Request): string {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return ''
  return auth.slice(7).trim()
}

/**
 * POST /api/sync/diary
 *
 * 支援兩種 token 傳法：
 * 1. JSON body: { "token": "..." }
 * 2. Header: Authorization: Bearer ...
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(request: Request) {
  const serverToken = process.env.SYNC_TOKEN

  if (!serverToken) {
    return json(
      {
        success: false,
        error: 'SYNC_TOKEN not configured on server',
        tokenConfigured: false,
      },
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
    return json(
      {
        success: false,
        error: 'invalid JSON body',
        tokenConfigured: true,
      },
      { status: 400 }
    )
  }

  const incomingToken = body.token || getBearerToken(request)

  if (incomingToken !== serverToken) {
    return json(
      {
        success: false,
        error: 'unauthorized',
        tokenConfigured: true,
        acceptedTokenMethods: ['body.token', 'Authorization: Bearer <token>'],
      },
      { status: 401 }
    )
  }

  const { date, title, entries } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ success: false, error: 'invalid or missing date (YYYY-MM-DD)' }, { status: 400 })
  }

  if (!title) {
    return json({ success: false, error: 'missing title' }, { status: 400 })
  }

  if (!Array.isArray(entries)) {
    return json({ success: false, error: 'entries must be an array' }, { status: 400 })
  }

  try {
    mkdirSync(DATA_DIR, { recursive: true })

    const diaryFile = join(DATA_DIR, `diary_${date}.json`)
    writeFileSync(diaryFile, JSON.stringify({ date, title, entries }, null, 2), 'utf-8')

    const indexPath = join(DATA_DIR, 'diary_index.json')
    let index: { date: string; title: string }[] = []

    if (existsSync(indexPath)) {
      try {
        const raw = readFileSync(indexPath, 'utf-8')
        const clean = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
        const parsed = JSON.parse(clean)
        index = Array.isArray(parsed) ? parsed : []
      } catch {
        index = []
      }
    }

    index = index.filter((e: { date: string }) => e.date !== date)
    index.push({ date, title })
    index.sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date))

    writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')

    const toSafeText = (value: unknown): string => {
      if (typeof value === 'string') return value
      if (value == null) return ''
      if (typeof value === 'number' || typeof value === 'boolean') return String(value)
      if (Array.isArray(value)) return value.map(toSafeText).join('')
      if (typeof value === 'object') {
        const obj = value as any
        return toSafeText(obj.text ?? obj.content ?? obj.plain_text ?? obj.name ?? '')
      }
      return ''
    }

    const normalizedEntries = entries.map((e: any) => ({
      type: typeof e?.type === 'string' ? e.type : 'paragraph',
      text: toSafeText(e?.text ?? e?.content ?? e?.plain_text ?? ''),
    }))

    initSchema()

    const db = getDb()
    const entriesText = JSON.stringify(normalizedEntries)

    db.prepare(
      `INSERT OR REPLACE INTO diary (id, title, date, content, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).run(date, title, date, entriesText)

    return json({
      success: true,
      date,
      title,
      entriesCount: entries.length,
      totalInIndex: index.length,
      tokenConfigured: true,
    })
  } catch (err) {
    console.error('[sync/diary] error:', err)
    return json(
      {
        success: false,
        error: 'internal server error',
        detail: String(err),
        tokenConfigured: true,
      },
      { status: 500 }
    )
  }
}
