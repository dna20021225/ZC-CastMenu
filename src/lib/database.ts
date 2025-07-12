import { Pool, PoolClient } from 'pg';

// データベース接続プール
let pool: Pool | null = null;

function createPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // 最大接続数
      idleTimeoutMillis: 30000, // アイドルタイムアウト
      connectionTimeoutMillis: 2000, // 接続タイムアウト
    });

    // エラーハンドリング
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });
  }
  
  return pool;
}

// データベース接続を取得
export async function getConnection(): Promise<PoolClient> {
  const dbPool = createPool();
  return await dbPool.connect();
}

// クエリ実行のヘルパー関数
export async function query(text: string, params?: unknown[]): Promise<unknown> {
  const client = await getConnection();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// トランザクション実行のヘルパー関数
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 接続プールの終了
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// データベース接続テスト
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getConnection();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}