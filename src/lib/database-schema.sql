-- ZC-CastMenu Database Schema
-- SQLite用スキーマ定義

-- キャストテーブル
CREATE TABLE IF NOT EXISTS casts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 100),
    height INTEGER NOT NULL CHECK (height > 0 AND height < 300),
    hobby TEXT,
    description TEXT,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- キャスト写真テーブル
CREATE TABLE IF NOT EXISTS cast_photos (
    id TEXT PRIMARY KEY,
    cast_id TEXT NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- キャスト能力値テーブル
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
);

-- バッジテーブル
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- キャストバッジ関連テーブル
CREATE TABLE IF NOT EXISTS cast_badges (
    cast_id TEXT REFERENCES casts(id) ON DELETE CASCADE,
    badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE,
    assigned_at TEXT DEFAULT (datetime('now')),
    assigned_by TEXT,
    PRIMARY KEY (cast_id, badge_id)
);

-- 管理者テーブル
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_casts_active ON casts(is_active);
CREATE INDEX IF NOT EXISTS idx_casts_name ON casts(name);
CREATE INDEX IF NOT EXISTS idx_cast_photos_cast_id ON cast_photos(cast_id);
CREATE INDEX IF NOT EXISTS idx_cast_photos_main ON cast_photos(is_main);
CREATE INDEX IF NOT EXISTS idx_cast_badges_cast_id ON cast_badges(cast_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
