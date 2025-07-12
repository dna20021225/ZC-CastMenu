-- ZC-CastMenu Database Schema
-- PostgreSQL用スキーマ定義

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- キャストテーブル
CREATE TABLE casts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 100),
    height INTEGER NOT NULL CHECK (height > 0 AND height < 300),
    hobby TEXT,
    description TEXT,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- キャスト写真テーブル
CREATE TABLE cast_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cast_id UUID NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- キャスト能力値テーブル
CREATE TABLE cast_stats (
    cast_id UUID PRIMARY KEY REFERENCES casts(id) ON DELETE CASCADE,
    looks INTEGER NOT NULL CHECK (looks >= 1 AND looks <= 100),
    talk INTEGER NOT NULL CHECK (talk >= 1 AND talk <= 100),
    alcohol_tolerance INTEGER NOT NULL CHECK (alcohol_tolerance >= 1 AND alcohol_tolerance <= 100),
    intelligence INTEGER NOT NULL CHECK (intelligence >= 1 AND intelligence <= 100),
    energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 100),
    custom_stat INTEGER CHECK (custom_stat >= 1 AND custom_stat <= 100),
    custom_stat_name VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- バッジテーブル
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- キャストバッジ関連テーブル
CREATE TABLE cast_badges (
    cast_id UUID REFERENCES casts(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (cast_id, badge_id)
);

-- 管理者テーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_casts_active ON casts(is_active);
CREATE INDEX idx_casts_name ON casts(name);
CREATE INDEX idx_cast_photos_cast_id ON cast_photos(cast_id);
CREATE INDEX idx_cast_photos_main ON cast_photos(is_main);
CREATE INDEX idx_cast_badges_cast_id ON cast_badges(cast_id);
CREATE INDEX idx_users_username ON users(username);

-- 更新日時自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新日時自動更新トリガー
CREATE TRIGGER update_casts_updated_at BEFORE UPDATE ON casts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cast_stats_updated_at BEFORE UPDATE ON cast_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期バッジデータ挿入
INSERT INTO badges (name, color, display_order) VALUES
    ('No.1', '#ffd700', 1),     -- ゴールド
    ('No.2', '#c0c0c0', 2),     -- シルバー
    ('No.3', '#cd7f32', 3),     -- ブロンズ
    ('オススメ', '#ef4444', 4),  -- レッド
    ('新人', '#22c55e', 5);      -- グリーン

-- 制約とルール
-- メイン写真は1キャストあたり1つまで
CREATE UNIQUE INDEX idx_cast_photos_main_unique 
ON cast_photos (cast_id) 
WHERE is_main = true;

-- コメント追加
COMMENT ON TABLE casts IS 'キャスト基本情報';
COMMENT ON TABLE cast_photos IS 'キャスト写真（複数枚対応）';
COMMENT ON TABLE cast_stats IS 'キャスト能力値（レーダーチャート用）';
COMMENT ON TABLE badges IS 'バッジマスタ';
COMMENT ON TABLE cast_badges IS 'キャストとバッジの関連';
COMMENT ON TABLE users IS '管理者ユーザー';