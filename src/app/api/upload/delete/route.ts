import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.info('画像削除開始');

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: '画像URLが指定されていません'
      }, { status: 400 });
    }

    // Vercel BlobのURLかローカルパスかを判定
    const isVercelBlob = url.includes('blob.vercel-storage.com');
    const isLocalPath = url.startsWith('/images/casts/');

    if (!isVercelBlob && !isLocalPath) {
      return NextResponse.json({
        success: false,
        error: '無効な画像URLです'
      }, { status: 400 });
    }

    // ローカルパスの場合は削除をスキップ（Git管理のため）
    if (isLocalPath) {
      console.info('ローカル画像のため削除をスキップ', { url });
      return NextResponse.json({
        success: true,
        message: 'ローカル画像は削除されません（Git管理）'
      });
    }

    // Vercel Blobの画像を削除
    try {
      await del(url);
      console.info('画像削除成功', { url });

      return NextResponse.json({
        success: true,
        message: '画像を削除しました'
      });

    } catch (error) {
      console.error('Vercel Blob削除エラー', error);
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
