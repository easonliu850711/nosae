import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  initSchema()
  const db = getDb()
  const rows = db.prepare('SELECT * FROM profile WHERE status = ?').all('active')
  return Response.json(rows)
}
