import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createAPILogger } from '@/lib/logger/server';
import { handleApiError, asyncHandler, ValidationError } from '@/lib/error-handler';
import { v4 as uuidv4 } from 'uuid';

const logger = createAPILogger('upload-api');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_DIR = join(process.cwd(), 'public', 'images', 'casts');

export const POST = asyncHandler(async (request: NextRequest) => {
    logger.info('画像アップロード開始');

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
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);
    const publicPath = `/images/casts/${fileName}`;

    try {
      // ディレクトリが存在しない場合は作成
      await mkdir(UPLOAD_DIR, { recursive: true });

      // ファイルを保存
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      logger.info('画像アップロード成功', { fileName, size: file.size });

      return NextResponse.json({
        success: true,
        data: {
          url: publicPath,
          fileName: fileName,
          size: file.size,
          type: file.type
        }
      });

    } catch (error) {
      logger.error('ファイル保存エラー', error);
      throw new Error('ファイルの保存に失敗しました');
    }
});