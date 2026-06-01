import { query } from './db';

/**
 * データベース初期化
 * SQLite構文で統一（開発: Better-SQLite3 / 本番: Turso）
 */
export async function initializeDatabase(): Promise<void> {
  // Casts テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS casts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER CHECK (age IS NULL OR (age > 0 AND age < 100)),
      height INTEGER CHECK (height IS NULL OR (height > 0 AND height < 300)),
      blood_type TEXT CHECK (blood_type IS NULL OR blood_type IN ('A', 'B', 'O', 'AB')),
      hobby TEXT,
      description TEXT,
      avatar_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 既存DBに対するマイグレーション: blood_typeカラムを追加（未追加の場合のみ）
  await ensureColumn('casts', 'blood_type', 'TEXT');
  // display_order カラム追加 + 既存データを created_at 順で初期化
  const added = await ensureColumn('casts', 'display_order', 'INTEGER DEFAULT 0');
  if (added) {
    await backfillDisplayOrder();
  }

  // Cast Photos テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS cast_photos (
      id TEXT PRIMARY KEY,
      cast_id TEXT NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
      photo_url TEXT NOT NULL,
      is_main INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Cast Stats テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS cast_stats (
      cast_id TEXT PRIMARY KEY REFERENCES casts(id) ON DELETE CASCADE,
      looks INTEGER NOT NULL CHECK (looks >= 1 AND looks <= 100),
      talk INTEGER NOT NULL CHECK (talk >= 1 AND talk <= 100),
      alcohol_tolerance INTEGER NOT NULL CHECK (alcohol_tolerance >= 1 AND alcohol_tolerance <= 100),
      intelligence INTEGER NOT NULL CHECK (intelligence >= 1 AND intelligence <= 100),
      energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 100),
      custom_stat INTEGER CHECK (custom_stat >= 1 AND custom_stat <= 100),
      custom_stat_name TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Badges テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3b82f6',
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Cast Badges 中間テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS cast_badges (
      cast_id TEXT REFERENCES casts(id) ON DELETE CASCADE,
      badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE,
      assigned_at TEXT DEFAULT (datetime('now')),
      assigned_by TEXT,
      PRIMARY KEY (cast_id, badge_id)
    )
  `);

  // Admins テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // インデックス
  await query(`CREATE INDEX IF NOT EXISTS idx_casts_active ON casts(is_active)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_casts_name ON casts(name)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_cast_photos_cast_id ON cast_photos(cast_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_cast_photos_main ON cast_photos(is_main)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_cast_badges_cast_id ON cast_badges(cast_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`);

  console.log('Database initialized successfully');
}

/**
 * カラムが存在しない場合のみ ALTER TABLE で追加
 * （SQLite には IF NOT EXISTS 構文がないため pragma で確認）
 * @returns 新しくカラムを追加した場合 true、既に存在していた場合 false
 */
async function ensureColumn(table: string, column: string, definition: string): Promise<boolean> {
  try {
    const result = await query(`PRAGMA table_info(${table})`);
    const exists = result.rows.some((row) => row.name === column);
    if (!exists) {
      await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Migrated: added column ${table}.${column}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Migration failed for ${table}.${column}`, error);
    return false;
  }
}

/**
 * 既存キャストに対し display_order を作成日順で初期化
 */
async function backfillDisplayOrder(): Promise<void> {
  try {
    const result = await query(
      `SELECT id FROM casts ORDER BY created_at ASC`
    );
    const rows = result.rows as Array<{ id: string }>;
    for (let i = 0; i < rows.length; i++) {
      await query(`UPDATE casts SET display_order = ? WHERE id = ?`, [i, rows[i].id]);
    }
    console.log(`Backfilled display_order for ${rows.length} casts`);
  } catch (error) {
    console.error('display_order backfill failed', error);
  }
}

/**
 * テーブル削除（開発用）
 */
export async function dropAllTables(): Promise<void> {
  await query('DROP TABLE IF EXISTS cast_stats');
  await query('DROP TABLE IF EXISTS cast_badges');
  await query('DROP TABLE IF EXISTS cast_photos');
  await query('DROP TABLE IF EXISTS badges');
  await query('DROP TABLE IF EXISTS casts');
  await query('DROP TABLE IF EXISTS admins');

  console.log('All tables dropped');
}
