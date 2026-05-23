import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  initSchema()
  const db = getDb()
  const rows = db.prepare('SELECT * FROM diary ORDER BY date DESC').all()
  return Response.json(rows)
}
