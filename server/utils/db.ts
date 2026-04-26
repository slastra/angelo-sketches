import { Database } from 'bun:sqlite'
import { mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

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
      width       INTEGER,
      height      INTEGER,
      created_at  INTEGER DEFAULT (unixepoch())
    )
  `)
  _db.run(`CREATE INDEX IF NOT EXISTS idx_sketches_order ON sketches(pinned DESC, position ASC)`)

  // Migrations for tables that pre-date a column.
  const cols = _db.query('PRAGMA table_info(sketches)').all() as { name: string }[]
  const has = (n: string) => cols.some(c => c.name === n)
  if (!has('version')) _db.run('ALTER TABLE sketches ADD COLUMN version INTEGER NOT NULL DEFAULT 1')
  if (!has('width'))   _db.run('ALTER TABLE sketches ADD COLUMN width INTEGER')
  if (!has('height'))  _db.run('ALTER TABLE sketches ADD COLUMN height INTEGER')

  // One-shot backfill of width/height for any rows missing dims.
  // Synchronous-ish: small dataset, runs at server boot, blocks first request.
  void backfillDims(_db)

  return _db
}

async function backfillDims(db: Database) {
  const missing = db
    .query('SELECT id, image_path FROM sketches WHERE image_path IS NOT NULL AND (width IS NULL OR height IS NULL)')
    .all() as { id: string, image_path: string }[]
  if (!missing.length) return

  const upd = db.prepare('UPDATE sketches SET width = ?, height = ? WHERE id = ?')
  for (const r of missing) {
    const path = join('.data/uploads', r.image_path)
    if (!existsSync(path)) continue
    try {
      const meta = await sharp(path).metadata()
      if (meta.width && meta.height) upd.run(meta.width, meta.height, r.id)
    } catch {
      // skip; this row keeps NULL dims and the client will fall back to defaults
    }
  }
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
  width: number | null
  height: number | null
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
  width: number | null
  height: number | null
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
    width: r.width,
    height: r.height,
  }
}
