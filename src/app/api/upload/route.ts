import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { asyncHandler, ValidationError } from '@/lib/error-handler';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB（タブレットカメラの大きい画像にも対応）

export const POST = asyncHandler(async (request: NextRequest) => {
    console.info('画像アップロード開始');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new ValidationError('ファイルが選択されていません');
    }

    // 画像ファイル全般を受け入れる（Android Googleフォト等の各種MIMEタイプ対応）
    if (!file.type.startsWith('image/')) {
      throw new ValidationError('画像ファイルを選択してください。');
    }

    // ファイルサイズの検証
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
    }

    // ファイル名の生成
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `casts/${uuidv4()}.${fileExtension}`;

    try {
      // Vercel Blobにアップロード
      const blob = await put(fileName, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.info('画像アップロード成功', { fileName, url: blob.url, size: file.size });

      return NextResponse.json({
        success: true,
        data: {
          url: blob.url,
          fileName: fileName,
          size: file.size,
          type: file.type
        }
      });

    } catch (error) {
      console.error('Vercel Blobアップロードエラー', error);
      throw new Error('ファイルの保存に失敗しました');
    }
});
