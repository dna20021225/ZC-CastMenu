import { Pool } from 'pg';
import { createAPILogger } from './logger';

const logger = createAPILogger('database');

// 接続プールを作成
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 接続エラーハンドリング
pool.on('error', (err) => {
  logger.error('データベース接続エラー', err);
});

// クエリ実行関数
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('クエリ実行', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('クエリエラー', error, { text, params });
    throw error;
  }
}

// トランザクション用のクライアント取得
export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => {
    client.release();
  };

  // タイムアウトの設定
  const removeListener = () => {
    client.removeAllListeners();
  };

  client.on('error', (err) => {
    logger.error('クライアントエラー', err);
    release();
  });

  return { query, release, client, removeListener };
}

// トランザクション実行関数
export async function transaction<T>(
  callback: (client: { query: (text: string, params?: unknown[]) => Promise<unknown> }) => Promise<T>
): Promise<T> {
  const { client, release, removeListener } = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback({ query: client.query.bind(client) });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    removeListener();
    release();
  }
}

// 接続確認関数
export async function checkConnection() {
  try {
    const result = await query('SELECT NOW()');
    logger.info('データベース接続成功', { time: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('データベース接続失敗', error);
    return false;
  }
}