import { getDb } from './db'

export function initSchema(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      title           TEXT,
      description     TEXT,
      avatar_url      TEXT,
      logo_url        TEXT,
      status          TEXT DEFAULT 'active',
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS diary (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      date            TEXT NOT NULL,
      summary         TEXT,
      content         TEXT,
      tags            TEXT,
      source_url      TEXT,
      last_edited_time TEXT,
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS thoughts (
      id              TEXT PRIMARY KEY,
      title           TEXT,
      content         TEXT,
      mood            TEXT,
      date            TEXT,
      last_edited_time TEXT,
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      description     TEXT,
      status          TEXT,
      progress        REAL DEFAULT 0,
      tags            TEXT,
      repo_url        TEXT,
      demo_url        TEXT,
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      start_time      TEXT,
      end_time        TEXT,
      location        TEXT,
      status          TEXT,
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skills (
      id              TEXT PRIMARY KEY,
      category        TEXT,
      name            TEXT NOT NULL,
      level           TEXT,
      description     TEXT,
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status (
      id              TEXT PRIMARY KEY,
      label           TEXT NOT NULL,
      value           TEXT NOT NULL,
      type            TEXT,
      updated_at      TEXT DEFAULT (datetime('now'))
    );
  `)
}
