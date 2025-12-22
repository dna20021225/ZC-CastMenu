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

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to initialize database schema' 
  }, { status: 405 });
}