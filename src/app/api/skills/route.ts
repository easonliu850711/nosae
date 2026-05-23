import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  initSchema()
  const db = getDb()
  const rows = db.prepare('SELECT * FROM skills ORDER BY category, name').all()
  return Response.json(rows)
}
