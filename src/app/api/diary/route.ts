import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  initSchema()
  const db = getDb()

  // 查詢字串支援 ?date=YYYY-MM-DD 單篇查詢
  const rows = db
    .prepare('SELECT id, title, date, summary, content, tags FROM diary ORDER BY date DESC')
    .all()

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

  const normalizeEntries = (content: unknown) => {
    let raw: unknown = []
    try {
      raw = typeof content === 'string' && content ? JSON.parse(content) : content
    } catch {
      raw = []
    }

    if (!Array.isArray(raw)) return []

    return raw.map((block: any) => ({
      type: typeof block?.type === 'string' ? block.type : 'paragraph',
      text: toSafeText(block?.text ?? block?.content ?? block?.plain_text ?? ''),
    }))
  }

  // 解析 content 並保證 entries 永遠是 { type, text:string }[]
  const diaries = rows.map((row: any) => {
    const entries = normalizeEntries(row.content)
    return {
      id: row.id,
      date: toSafeText(row.date),
      title: toSafeText(row.title) || toSafeText(row.date),
      summary: toSafeText(row.summary),
      entries,
      tags: toSafeText(row.tags),
    }
  })

  return Response.json(diaries)
}
