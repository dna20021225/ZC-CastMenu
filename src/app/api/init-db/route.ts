import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    // SQLスキーマファイルを読み込み
    const schemaPath = join(process.cwd(), 'src/lib/database-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // スキーマを実行
    await query(schema);

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