const bcrypt = require('bcryptjs');
const { query } = require('../src/lib/db');

async function setupAdmin() {
  try {
    // 管理者テーブルの作成
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('管理者テーブルを作成しました');

    // パスワードをハッシュ化
    const password = 'admin123'; // 本番環境では必ず変更してください
    const hashedPassword = await bcrypt.hash(password, 10);

    // 初期管理者を作成
    await query(
      `INSERT INTO admins (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@zc-castmenu.com', hashedPassword, 'システム管理者', 'super_admin']
    );
    
    console.log('初期管理者アカウントを作成しました');
    console.log('メールアドレス: admin@zc-castmenu.com');
    console.log('パスワード: admin123');
    console.log('※本番環境では必ずパスワードを変更してください');
    
    process.exit(0);
  } catch (error) {
    console.error('セットアップ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

setupAdmin();