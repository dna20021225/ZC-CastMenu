import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { asyncHandler, ValidationError } from '@/lib/error-handler';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const POST = asyncHandler(async (request: NextRequest) => {
    console.info('画像アップロード開始');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new ValidationError('ファイルが選択されていません');
    }

    // ファイルタイプの検証
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError('対応していないファイル形式です。JPEG、PNG、WebPのみ対応しています。');
    }

    // ファイルサイズの検証
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
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
