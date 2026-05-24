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

  // 解析 content (JSON string → entries array) 並轉換為前端相容格式
  const diaries = rows.map((row: any) => {
    let entries: { type: string; text: string }[] = []
    try {
      if (row.content) {
        entries = JSON.parse(row.content)
      }
    } catch {
      entries = []
    }
    return {
      id: row.id,
      date: row.date,
      title: row.title,
      summary: row.summary || '',
      entries,
      tags: row.tags || '',
    }
  })

  return Response.json(diaries)
}
