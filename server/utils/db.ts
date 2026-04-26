import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'

let _db: Database | null = null

export function useDb(): Database {
  if (_db) return _db

  mkdirSync('.data', { recursive: true })

  _db = new Database('.data/angelo.db')
  _db.run('PRAGMA journal_mode = WAL')
  _db.run('PRAGMA foreign_keys = ON')

  _db.run(`
    CREATE TABLE IF NOT EXISTS sketches (
      id          TEXT PRIMARY KEY,
      date        TEXT NOT NULL,
      date_iso    TEXT NOT NULL,
      tags        TEXT NOT NULL DEFAULT '[]',
      image_path  TEXT,
      pinned      INTEGER NOT NULL DEFAULT 0,
      position    INTEGER NOT NULL,
      version     INTEGER NOT NULL DEFAULT 1,
      created_at  INTEGER DEFAULT (unixepoch())
    )
  `)
  _db.run(`CREATE INDEX IF NOT EXISTS idx_sketches_order ON sketches(pinned DESC, position ASC)`)

  // Migration: add `version` column for existing rows from before this column existed.
  const cols = _db.query('PRAGMA table_info(sketches)').all() as { name: string }[]
  if (!cols.some(c => c.name === 'version')) {
    _db.run('ALTER TABLE sketches ADD COLUMN version INTEGER NOT NULL DEFAULT 1')
  }

  return _db
}

export interface SketchRow {
  id: string
  date: string
  date_iso: string
  tags: string
  image_path: string | null
  pinned: number
  position: number
  version: number
  created_at: number
}

export interface Sketch {
  id: string
  date: string
  dateIso: string
  tags: string[]
  image: string | null
  pinned: boolean
  position: number
  version: number
}

export function rowToSketch(r: SketchRow): Sketch {
  return {
    id: r.id,
    date: r.date,
    dateIso: r.date_iso,
    tags: JSON.parse(r.tags) as string[],
    image: r.image_path ? `/uploads/${r.image_path}?v=${r.version}` : null,
    pinned: r.pinned === 1,
    position: r.position,
    version: r.version,
  }
}
