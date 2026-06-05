import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    // SQLスキーマファイルを読み込み
    const schemaPath = join(process.cwd(), 'src/lib/database-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // コメント行を除去してからSQL文を分割
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // SQL文を分割して個別に実行
    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await query(statement);
    }

    // マイグレーション: 既存DBに対する追加対応
    await migrateCastsTable();
    await backfillMissingCastStats();

    // 初期バッジデータを挿入（存在しない場合のみ）
    const existingBadges = await query('SELECT COUNT(*) as count FROM badges');
    if ((existingBadges.rows[0] as { count: number }).count === 0) {
      const badges = [
        { name: 'No.1', color: '#ffd700', order: 1 },
        { name: 'No.2', color: '#c0c0c0', order: 2 },
        { name: 'No.3', color: '#cd7f32', order: 3 },
        { name: 'オススメ', color: '#ef4444', order: 4 },
        { name: '新人', color: '#22c55e', order: 5 },
      ];

      for (const badge of badges) {
        await query(
          'INSERT INTO badges (id, name, color, display_order) VALUES (?, ?, ?, ?)',
          [uuidv4(), badge.name, badge.color, badge.order]
        );
      }
    }

    // 料金メニュー：カテゴリと項目が空のときだけ初期データを投入
    await seedMenuInitialData();

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * casts テーブルのマイグレーション
 * - blood_type カラム追加
 * - display_order カラム追加と作成日順での初期値設定
 * - age/height の NOT NULL 制約撤去（テーブル再構築）
 */
async function migrateCastsTable(): Promise<void> {
  // 現在のカラム情報を取得
  const columnsResult = await query(`PRAGMA table_info(casts)`);
  const columns = columnsResult.rows as Array<{ name: string; notnull: number }>;

  const hasBloodType = columns.some(col => col.name === 'blood_type');
  const hasDisplayOrder = columns.some(col => col.name === 'display_order');
  const ageCol = columns.find(col => col.name === 'age');
  const heightCol = columns.find(col => col.name === 'height');
  const ageIsNotNull = ageCol?.notnull === 1;
  const heightIsNotNull = heightCol?.notnull === 1;

  // blood_type カラム追加
  if (!hasBloodType) {
    await query(`ALTER TABLE casts ADD COLUMN blood_type TEXT`);
    console.log('Migration: added casts.blood_type');
  }

  // display_order カラム追加 + 既存データを作成日順で初期化
  if (!hasDisplayOrder) {
    await query(`ALTER TABLE casts ADD COLUMN display_order INTEGER DEFAULT 0`);
    console.log('Migration: added casts.display_order');

    const existing = await query(`SELECT id FROM casts ORDER BY created_at ASC`);
    const ids = (existing.rows as Array<{ id: string }>).map(r => r.id);
    for (let i = 0; i < ids.length; i++) {
      await query(`UPDATE casts SET display_order = ? WHERE id = ?`, [i, ids[i]]);
    }
    console.log(`Migration: backfilled display_order for ${ids.length} casts`);
  }

  // age/height のNOT NULL制約を撤去するためテーブル再構築
  if (ageIsNotNull || heightIsNotNull) {
    console.log('Migration: rebuilding casts table to drop NOT NULL on age/height');
    await query(`
      CREATE TABLE casts_new (
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
    await query(`
      INSERT INTO casts_new (id, name, age, height, blood_type, hobby, description, avatar_url, display_order, is_active, created_at, updated_at)
      SELECT id, name, age, height, blood_type, hobby, description, avatar_url, display_order, is_active, created_at, updated_at FROM casts
    `);
    await query(`DROP TABLE casts`);
    await query(`ALTER TABLE casts_new RENAME TO casts`);
    // インデックス再作成
    await query(`CREATE INDEX IF NOT EXISTS idx_casts_active ON casts(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_casts_name ON casts(name)`);
    console.log('Migration: casts table rebuilt');
  }
}

/**
 * cast_stats レコードが存在しない既存キャストに、デフォルト値（全 50）の
 * レコードを補填するマイグレーション
 */
async function backfillMissingCastStats(): Promise<void> {
  const missing = await query(
    `SELECT c.id FROM casts c
     LEFT JOIN cast_stats s ON c.id = s.cast_id
     WHERE s.cast_id IS NULL`
  );
  const ids = (missing.rows as Array<{ id: string }>).map(r => r.id);
  for (const id of ids) {
    await query(
      `INSERT INTO cast_stats (cast_id, looks, talk, alcohol_tolerance, intelligence, energy)
       VALUES (?, 50, 50, 50, 50, 50)`,
      [id]
    );
  }
  if (ids.length > 0) {
    console.log(`Migration: backfilled cast_stats for ${ids.length} casts`);
  }
}

/**
 * 料金メニュー（menu_categories / menu_items）に初期データが無い場合のみ投入する。
 * クライアントから提供された内容:
 *   セットプラン:
 *     - 90分（鏡月・割りもの飲み放題） 1,000円
 *     - 90分（缶もの飲み放題）         3,000円
 *   オプション:
 *     - フリータイム（場内指名1名分込み）+5,000円
 *     - コール付きシャンパン            5,000円
 *     - 場内指名（1名）                 1,000円
 */
async function seedMenuInitialData(): Promise<void> {
  const catCount = await query('SELECT COUNT(*) as count FROM menu_categories') as unknown as { rows: { count: number }[] };
  const itemCount = await query('SELECT COUNT(*) as count FROM menu_items') as unknown as { rows: { count: number }[] };

  if ((catCount.rows[0]?.count ?? 0) > 0 || (itemCount.rows[0]?.count ?? 0) > 0) {
    return;
  }

  console.log('Seeding menu initial data');

  const setCategoryId = randomUUID();
  const optionCategoryId = randomUUID();

  await query(
    `INSERT INTO menu_categories (id, name, name_en, icon, color, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [setCategoryId, 'セットプラン', 'SET', 'Clock', '#6366f1', 0]
  );
  await query(
    `INSERT INTO menu_categories (id, name, name_en, icon, color, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [optionCategoryId, 'オプション', 'OPTION', 'PlusCircle', '#ec4899', 1]
  );

  const setItems: Array<[string, number, string | null]> = [
    ['90分', 1000, '鏡月・割りもの飲み放題'],
    ['90分', 3000, '缶もの飲み放題'],
  ];
  for (let i = 0; i < setItems.length; i++) {
    const [name, price, note] = setItems[i];
    await query(
      `INSERT INTO menu_items (id, category_id, name, price, note, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), setCategoryId, name, price, note, i]
    );
  }

  const optionItems: Array<[string, number, string | null]> = [
    ['フリータイム', 5000, '場内指名1名分込み（追加料金）'],
    ['コール付きシャンパン', 5000, null],
    ['場内指名（1名）', 1000, null],
  ];
  for (let i = 0; i < optionItems.length; i++) {
    const [name, price, note] = optionItems[i];
    await query(
      `INSERT INTO menu_items (id, category_id, name, price, note, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), optionCategoryId, name, price, note, i]
    );
  }

  console.log('Menu seeding complete');
}

// uuidv4 のショートカット（モジュール先頭で import すると DCE 対象になり消える可能性があるため局所定義）
function randomUUID(): string {
  return uuidv4();
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to initialize database schema'
  }, { status: 405 });
}
