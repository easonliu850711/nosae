import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  initSchema()
  const db = getDb()
  const row = db.prepare('SELECT * FROM diary WHERE id = ?').get(id)
  if (!row) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(row)
}
