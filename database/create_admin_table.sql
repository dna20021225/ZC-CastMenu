-- 管理者テーブルの作成
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期管理者アカウントの作成
-- パスワード: admin123 (本番環境では変更すること)
INSERT INTO admins (email, password_hash, name, role) VALUES
('admin@zc-castmenu.com', '$2a$10$YourHashedPasswordHere', 'システム管理者', 'super_admin')
ON CONFLICT (email) DO NOTHING;