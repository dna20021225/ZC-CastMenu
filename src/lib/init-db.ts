import { query } from './db';

/**
 * データベース初期化
 * PostgreSQLとSQLiteでは型が異なるため、SQLite構文で統一
 */
export async function initializeDatabase(): Promise<void> {
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

  // Casts テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS casts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      height INTEGER,
      hobbies TEXT,
      comment TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Badges テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Cast_Badges 中間テーブル
  await query(`
    CREATE TABLE IF NOT EXISTS cast_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(cast_id, badge_id)
    )
  `);

  // Cast_Stats テーブル（レーダーチャート用）
  await query(`
    CREATE TABLE IF NOT EXISTS cast_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER UNIQUE NOT NULL,
      looks INTEGER DEFAULT 50 CHECK(looks >= 1 AND looks <= 100),
      talk INTEGER DEFAULT 50 CHECK(talk >= 1 AND talk <= 100),
      alcohol_tolerance INTEGER DEFAULT 50 CHECK(alcohol_tolerance >= 1 AND alcohol_tolerance <= 100),
      intelligence INTEGER DEFAULT 50 CHECK(intelligence >= 1 AND intelligence <= 100),
      energy INTEGER DEFAULT 50 CHECK(energy >= 1 AND energy <= 100),
      custom_stat INTEGER DEFAULT 50 CHECK(custom_stat >= 1 AND custom_stat <= 100),
      custom_stat_name TEXT DEFAULT 'カスタム',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
    )
  `);

  // インデックス作成
  await query(`CREATE INDEX IF NOT EXISTS idx_casts_is_active ON casts(is_active)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_cast_badges_cast_id ON cast_badges(cast_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_cast_badges_badge_id ON cast_badges(badge_id)`);

  // 初期バッジデータ
  await query(`
    INSERT OR IGNORE INTO badges (name, display_name, color) VALUES
    ('no1', 'No.1', '#FFD700'),
    ('no2', 'No.2', '#C0C0C0'),
    ('no3', 'No.3', '#CD7F32'),
    ('recommend', 'オススメ', '#3b82f6'),
    ('new', '新人', '#10b981')
  `);

  console.log('Database initialized successfully');
}

/**
 * テーブル削除（開発用）
 */
export async function dropAllTables(): Promise<void> {
  await query('DROP TABLE IF EXISTS cast_stats');
  await query('DROP TABLE IF EXISTS cast_badges');
  await query('DROP TABLE IF EXISTS badges');
  await query('DROP TABLE IF EXISTS casts');
  await query('DROP TABLE IF EXISTS admins');

  console.log('All tables dropped');
}
