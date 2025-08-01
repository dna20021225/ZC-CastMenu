import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

// Logger initialization moved

export async function POST(request: NextRequest) {
  try {
    console.info('画像削除開始');

    const body = await request.json();
    const { url } = body;

    if (!url || !url.startsWith('/images/casts/')) {
      return NextResponse.json({
        success: false,
        error: '無効な画像URLです'
      }, { status: 400 });
    }

    // ファイル名を取得
    const fileName = url.split('/').pop();
    if (!fileName) {
      return NextResponse.json({
        success: false,
        error: 'ファイル名が不正です'
      }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', 'images', 'casts', fileName);

    try {
      await unlink(filePath);
      console.info('画像削除成功', { fileName });

      return NextResponse.json({
        success: true,
        message: '画像を削除しました'
      });

    } catch (error) {
      console.error('ファイル削除エラー', error);
      return NextResponse.json({
        success: false,
        error: 'ファイルの削除に失敗しました'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('画像削除エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: '画像の削除に失敗しました'
    }, { status: 500 });
  }
}