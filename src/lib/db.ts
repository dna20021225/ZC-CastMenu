import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import path from 'path';

// 動的インポートでロガーを取得
let logger: {
  error: (msg: string, data?: unknown) => void;
  info?: (msg: string, data?: unknown) => void;
  debug?: (msg: string, data?: unknown) => void;
} = console;

if (typeof window === 'undefined') {
  import('./logger')
    .then(({ createAPILogger }) => {
      logger = createAPILogger('database');
    })
    .catch(() => {
      logger = console;
    });
}

// 環境判定
// USE_LOCAL_DB=true でローカルSQLiteを強制使用（ビルド時に便利）
// USE_TURSO=true でTursoを強制使用
// それ以外は NODE_ENV で判定
const forceLocalDb = process.env.USE_LOCAL_DB === 'true';
const forceTurso = process.env.USE_TURSO === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const useTurso = !forceLocalDb && (forceTurso || isProduction);

// Tursoクライアント（本番環境）
let tursoClient: ReturnType<typeof createClient> | null = null;

// Better-SQLite3（開発環境）
let localDb: Database.Database | null = null;

/**
 * Tursoクライアントの初期化
 */
function getTursoClient() {
  if (!tursoClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    }

    tursoClient = createClient({
      url,
      authToken,
    });

    if (logger.info) {
      logger.info('Turso client initialized');
    }
  }

  return tursoClient;
}

/**
 * ローカルSQLiteデータベースの初期化
 */
function getLocalDb() {
  if (!localDb) {
    const dbPath = path.join(process.cwd(), 'data', 'castmenu.db');
    localDb = new Database(dbPath);

    // WALモードを有効化（パフォーマンス向上）
    localDb.pragma('journal_mode = WAL');

    if (logger.info) {
      logger.info('Local SQLite database initialized', { path: dbPath });
    }
  }

  return localDb;
}

/**
 * クエリ実行関数（Turso対応）
 */
export async function query(
  text: string,
  params?: unknown[]
): Promise<{ rows: Record<string, unknown>[] }> {
  const start = Date.now();

  try {
    if (useTurso) {
      // Turso（本番環境）
      const client = getTursoClient();
      const result = await client.execute({
        sql: text,
        args: params || [],
      });

      const duration = Date.now() - start;
      if (logger.debug) {
        logger.debug('Turso query executed', {
          sql: text,
          duration,
          rowCount: result.rows.length,
        });
      }

      return {
        rows: result.rows as Record<string, unknown>[],
      };
    } else {
      // Better-SQLite3（開発環境）
      const db = getLocalDb();
      const stmt = db.prepare(text);

      // SQL文の種類に応じてrun()とall()を使い分け
      const trimmedSql = text.trim().toUpperCase();
      const isSelectQuery = trimmedSql.startsWith('SELECT');

      let rows: unknown[];
      if (isSelectQuery) {
        // SELECT文はall()でデータ取得
        rows = params ? stmt.all(...params) : stmt.all();
      } else {
        // CREATE/INSERT/UPDATE/DELETE文はrun()を使用
        const result = params ? stmt.run(...params) : stmt.run();
        // run()の結果を返す（変更行数など）
        rows = [{ changes: result.changes, lastInsertRowid: result.lastInsertRowid }];
      }

      const duration = Date.now() - start;
      if (logger.debug) {
        logger.debug('SQLite query executed', {
          sql: text,
          duration,
          rowCount: Array.isArray(rows) ? rows.length : 0,
        });
      }

      return {
        rows: (Array.isArray(rows) ? rows : [rows]) as Record<string, unknown>[],
      };
    }
  } catch (error) {
    logger.error('Query error', { error, sql: text, params });
    throw error;
  }
}

/**
 * 単一行取得
 */
export async function queryOne(
  text: string,
  params?: unknown[]
): Promise<Record<string, unknown> | null> {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * トランザクション実行関数
 */
export async function transaction<T>(
  callback: (exec: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>) => Promise<T>
): Promise<T> {
  if (useTurso) {
    // Tursoの場合、トランザクションAPIを使用
    const client = getTursoClient();
    const tx = await client.transaction('write');

    try {
      const exec = async (text: string, params?: unknown[]) => {
        const result = await tx.execute({
          sql: text,
          args: params || [],
        });
        return { rows: result.rows as Record<string, unknown>[] };
      };

      const result = await callback(exec);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } else {
    // Better-SQLite3の場合
    const db = getLocalDb();

    return db.transaction(() => {
      const exec = async (text: string, params?: unknown[]) => {
        const stmt = db.prepare(text);
        const rows = params ? stmt.all(...params) : stmt.all();
        return {
          rows: (Array.isArray(rows) ? rows : [rows]) as Record<string, unknown>[],
        };
      };

      return callback(exec);
    })();
  }
}

/**
 * データベース接続確認
 */
export async function checkConnection(): Promise<boolean> {
  try {
    if (useTurso) {
      const client = getTursoClient();
      await client.execute('SELECT 1');
      if (logger.info) {
        logger.info('Turso connection successful');
      }
    } else {
      const db = getLocalDb();
      db.prepare('SELECT 1').get();
      if (logger.info) {
        logger.info('SQLite connection successful');
      }
    }
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
}

/**
 * データベース接続のクローズ
 */
export function closeConnection(): void {
  if (localDb) {
    localDb.close();
    localDb = null;
    if (logger.info) {
      logger.info('SQLite connection closed');
    }
  }

  if (tursoClient) {
    tursoClient.close();
    tursoClient = null;
    if (logger.info) {
      logger.info('Turso connection closed');
    }
  }
}
