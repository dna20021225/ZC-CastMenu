const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');

// 環境変数から取得（使用時に設定してください）
const TURSO_URL = process.env.TURSO_DATABASE_URL || '';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

// テーブル作成SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS casts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL,
    hobby TEXT,
    description TEXT,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cast_photos (
    id TEXT PRIMARY KEY,
    cast_id TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cast_stats (
    cast_id TEXT PRIMARY KEY,
    looks INTEGER,
    talk INTEGER,
    alcohol_tolerance INTEGER,
    intelligence INTEGER,
    energy INTEGER,
    custom_stat INTEGER,
    custom_stat_name TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cast_badges (
    cast_id TEXT,
    badge_id TEXT,
    assigned_at TEXT DEFAULT (datetime('now')),
    assigned_by TEXT,
    PRIMARY KEY (cast_id, badge_id)
);

CREATE TABLE IF NOT EXISTS drink_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    icon TEXT DEFAULT 'Wine',
    color TEXT DEFAULT '#6366f1',
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drinks (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    note TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
`;

async function syncToTurso() {
  const localDb = new Database('./data/castmenu.db');
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  const tables = [
    'badges',
    'casts',
    'cast_photos',
    'cast_stats',
    'cast_badges',
    'drink_categories',
    'drinks',
  ];

  try {
    // テーブル作成
    console.log('=== テーブル作成 ===');
    const statements = createTableSQL.split(';').filter(s => s.trim());
    for (const sql of statements) {
      await turso.execute(sql);
    }
    console.log('テーブル作成完了\n');

    for (const table of tables) {
      console.log(`\n=== ${table} ===`);

      // ローカルデータ取得
      const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
      console.log(`ローカル: ${rows.length}件`);

      if (rows.length === 0) continue;

      // Tursoの既存データを削除
      await turso.execute(`DELETE FROM ${table}`);
      console.log('Turso: 既存データ削除');

      // データ挿入
      for (const row of rows) {
        const columns = Object.keys(row);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(col => row[col]);

        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        await turso.execute({ sql, args: values });
      }
      console.log(`Turso: ${rows.length}件挿入完了`);
    }

    console.log('\n同期完了!');
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    localDb.close();
    turso.close();
  }
}

syncToTurso();
