import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const revalidate = 60

export async function GET() {
  initSchema()
  const db = getDb()
  const rows = db.prepare('SELECT * FROM schedule ORDER BY start_time ASC').all()
  return Response.json(rows)
}
