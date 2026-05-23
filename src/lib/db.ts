import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = process.env.NOSAE_DB_PATH || path.join(process.cwd(), 'data', 'nosae.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  db = new Database(DB_PATH)

  // Windows file lock 対策
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
