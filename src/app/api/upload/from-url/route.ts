// URL を指定して画像を取り込み、Vercel Blob に保存する。
// Google Drive 共有リンクは直リンに変換してから fetch する。
// （Photo Picker から Drive を選べなくなった Android Chrome の代替経路として用意）
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { asyncHandler, ValidationError } from '@/lib/error-handler';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Google Drive の共有リンクから直接ダウンロード可能な URL に変換する。
// 受け付ける形式:
//   - https://drive.google.com/file/d/{ID}/view?usp=sharing
//   - https://drive.google.com/open?id={ID}
//   - https://drive.google.com/uc?id={ID}&export=download
// 上記以外（ID 抽出失敗）は null を返す。
function normalizeDriveUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (!url.hostname.endsWith('drive.google.com')) return null;

    // /file/d/{ID}/view 形式
    const filePathMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (filePathMatch) {
      return `https://drive.usercontent.google.com/download?id=${filePathMatch[1]}&export=download`;
    }

    // ?id={ID} クエリパラメータ形式
    const idParam = url.searchParams.get('id');
    if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) {
      return `https://drive.usercontent.google.com/download?id=${idParam}&export=download`;
    }

    return null;
  } catch {
    return null;
  }
}

export const POST = asyncHandler(async (request: NextRequest) => {
  console.info('URL画像取り込み開始');

  const body = await request.json().catch(() => null) as { url?: unknown } | null;
  const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

  if (!rawUrl) {
    throw new ValidationError('URLが指定されていません');
  }

  // http(s) のみ許可（SSRF対策の最低限の防御。意図しないプロトコルを弾く）
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ValidationError('URLの形式が正しくありません');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ValidationError('http または https の URL を指定してください');
  }

  // Drive URL なら直リンに変換。それ以外はそのまま使う。
  const fetchUrl = normalizeDriveUrl(rawUrl) ?? rawUrl;

  // タイムアウト付き fetch（30秒）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(fetchUrl, {
      signal: controller.signal,
      redirect: 'follow',
    });
  } catch (e) {
    clearTimeout(timeoutId);
    console.error('URL取得失敗', e);
    throw new ValidationError('指定されたURLからファイルを取得できませんでした');
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new ValidationError(`URLの取得に失敗しました (status: ${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    // Drive は限定公開だと HTML を返すので、image/ で始まらなければ画像じゃないと判定
    throw new ValidationError(
      '画像が取得できませんでした。Driveの場合は「リンクを知っている全員」公開設定になっているか確認してください'
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
    throw new ValidationError('ファイルサイズが大きすぎます（10MB以下にしてください）');
  }
  if (arrayBuffer.byteLength === 0) {
    throw new ValidationError('ファイルが空でした');
  }

  // MIME から拡張子を推定（不明なら jpg）
  const subtype = contentType.split('/')[1]?.split(';')[0]?.trim().toLowerCase() || 'jpg';
  const ext = subtype === 'jpeg' ? 'jpg' : subtype;
  const fileName = `casts/${uuidv4()}.${ext}`;

  try {
    const blob = await put(fileName, arrayBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType,
    });

    console.info('URL画像取り込み成功', {
      fileName,
      url: blob.url,
      size: arrayBuffer.byteLength,
      sourceUrl: rawUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        fileName,
        size: arrayBuffer.byteLength,
        type: contentType,
      },
    });
  } catch (error) {
    console.error('Vercel Blob アップロードエラー', error);
    throw new Error('ファイルの保存に失敗しました');
  }
});
