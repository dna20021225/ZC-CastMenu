import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { asyncHandler, ValidationError } from '@/lib/error-handler';
import { validateRequest, createCastSchema, castSearchParamsSchema } from '@/lib/validation';
import {
  ApiResponse,
  CastDetail,
  CastListResponse,
  CastSearchParams
} from '@/types/api';
import { Cast, CastPhoto, CastStats, Badge } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

// Logger initialization moved

// キャスト一覧取得 (GET /api/casts)
export const GET = asyncHandler(async (request: NextRequest) => {
    console.info('キャスト一覧取得開始');
    
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータのバリデーション
    const rawParams = {
      search: searchParams.get('search') || undefined,
      badges: searchParams.get('badges')?.split(',') || undefined,
      age_min: searchParams.get('age_min') ? parseInt(searchParams.get('age_min')!) : undefined,
      age_max: searchParams.get('age_max') ? parseInt(searchParams.get('age_max')!) : undefined,
      height_min: searchParams.get('height_min') ? parseInt(searchParams.get('height_min')!) : undefined,
      height_max: searchParams.get('height_max') ? parseInt(searchParams.get('height_max')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sort_by: (searchParams.get('sort_by') as CastSearchParams['sort_by']) || 'created_at',
      sort_order: (searchParams.get('sort_order') as CastSearchParams['sort_order']) || 'desc'
    };

    const validation = validateRequest(castSearchParamsSchema, rawParams);
    if (!validation.success) {
      throw new ValidationError('検索パラメータが無効です', validation.errors);
    }
    
    const params = validation.data;

    // WHERE句の構築
    const conditions: string[] = ['c.is_active = 1'];
    const queryParams: unknown[] = [];

    if (params.search) {
      conditions.push(`c.name LIKE ?`);
      queryParams.push(`%${params.search}%`);
    }

    if (params.age_min) {
      conditions.push(`c.age >= ?`);
      queryParams.push(params.age_min);
    }

    if (params.age_max) {
      conditions.push(`c.age <= ?`);
      queryParams.push(params.age_max);
    }

    if (params.height_min) {
      conditions.push(`c.height >= ?`);
      queryParams.push(params.height_min);
    }

    if (params.height_max) {
      conditions.push(`c.height <= ?`);
      queryParams.push(params.height_max);
    }

    // バッジフィルタ
    let badgeJoin = '';
    if (params.badges && params.badges.length > 0) {
      const placeholders = params.badges.map(() => `?`).join(',');
      queryParams.push(...params.badges);
      badgeJoin = `
        INNER JOIN cast_badges cb ON c.id = cb.cast_id
        INNER JOIN badges b ON cb.badge_id = b.id AND b.name IN (${placeholders})
      `;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // バッジ優先度でソート（No.1 > No.2 > No.3 > バッジ数順）
    const orderClause = `
      ORDER BY
        COALESCE((SELECT MIN(CASE
          WHEN b2.name = 'No.1' THEN 1
          WHEN b2.name = 'No.2' THEN 2
          WHEN b2.name = 'No.3' THEN 3
          ELSE 999
        END) FROM cast_badges cb2
        INNER JOIN badges b2 ON cb2.badge_id = b2.id
        WHERE cb2.cast_id = c.id), 999) ASC,
        (SELECT COUNT(*) FROM cast_badges cb3 WHERE cb3.cast_id = c.id) DESC,
        c.created_at DESC
    `;

    // ページネーション
    const offset = ((params.page || 1) - 1) * (params.limit || 20);
    queryParams.push(params.limit, offset);
    const paginationClause = `LIMIT ? OFFSET ?`;

    // メインクエリ
    const castsQuery = `
      SELECT DISTINCT c.*
      FROM casts c
      ${badgeJoin}
      ${whereClause}
      ${orderClause}
      ${paginationClause}
    `;

    console.debug('キャスト一覧クエリ実行', { query: castsQuery, params: queryParams });
    
    const castsResult = await query(castsQuery, queryParams) as unknown as { rows: Cast[] };
    const casts = castsResult.rows;

    // 各キャストの関連データを取得
    const castDetails: CastDetail[] = await Promise.all(
      casts.map(async (cast) => {
        // 写真を取得
        const photosResult = await query(
          'SELECT * FROM cast_photos WHERE cast_id = ? ORDER BY order_index',
          [cast.id]
        ) as unknown as { rows: CastPhoto[] };

        // 能力値を取得
        const statsResult = await query(
          'SELECT * FROM cast_stats WHERE cast_id = ?',
          [cast.id]
        ) as unknown as { rows: CastStats[] };

        // バッジを取得
        const badgesResult = await query(`
          SELECT b.*, cb.assigned_at
          FROM badges b
          INNER JOIN cast_badges cb ON b.id = cb.badge_id
          WHERE cb.cast_id = ?
          ORDER BY b.display_order
        `, [cast.id]) as unknown as { rows: (Badge & { assigned_at: string })[] };

        return {
          ...cast,
          photos: photosResult.rows,
          stats: statsResult.rows[0] || {
            cast_id: cast.id,
            looks: 0,
            talk: 0,
            alcohol_tolerance: 0,
            intelligence: 0,
            energy: 0,
            custom_stat: null,
            custom_stat_name: null,
            updated_at: new Date().toISOString()
          },
          badges: badgesResult.rows
        };
      })
    );

    // 総件数を取得
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM casts c
      ${badgeJoin}
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2)) as unknown as { rows: [{ total: string }] };
    const total = parseInt(countResult.rows[0].total);

    const response: CastListResponse = {
      casts: castDetails,
      total,
      page: params.page || 1,
      limit: params.limit || 20
    };

    console.info('キャスト一覧取得完了', { total, page: params.page, limit: params.limit });

    return NextResponse.json({
      success: true,
      data: response
    } as ApiResponse<CastListResponse>);
});

// キャスト作成 (POST /api/casts)
export const POST = asyncHandler(async (request: NextRequest) => {
    console.info('キャスト作成開始');
    
    const body = await request.json();

    // リクエストボディのバリデーション
    const validation = validateRequest(createCastSchema, body);
    if (!validation.success) {
      throw new ValidationError('入力データが無効です', validation.errors);
    }
    
    const validatedData = validation.data;

    // UUIDを生成
    const castId = uuidv4();

    // キャスト基本情報を作成
    await query(`
      INSERT INTO casts (id, name, age, height, description, avatar_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
      castId,
      validatedData.name,
      validatedData.age,
      validatedData.height,
      validatedData.description || null,
      validatedData.profile_image || null
    ]);

    // 能力値を作成（フォームのフィールド名をDBカラム名にマッピング）
    await query(`
      INSERT INTO cast_stats (cast_id, looks, talk, alcohol_tolerance, intelligence, energy, custom_stat, custom_stat_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      castId,
      validatedData.stats.looks || 50,
      validatedData.stats.talk || 50,
      validatedData.stats.drinking || 50,      // drinking -> alcohol_tolerance
      validatedData.stats.intelligence || 50,
      validatedData.stats.tension || 50,       // tension -> energy
      validatedData.stats.special || null,     // special -> custom_stat
      null
    ]);

    // 複数写真を追加（photos配列がある場合）
    const photos = (body.photos as string[]) || [];
    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photoId = uuidv4();
        await query(`
          INSERT INTO cast_photos (id, cast_id, photo_url, is_main, order_index)
          VALUES (?, ?, ?, ?, ?)
        `, [photoId, castId, photos[i], i === 0 ? 1 : 0, i]);
      }
    } else if (validatedData.profile_image) {
      // 後方互換性: profile_imageのみの場合
      await query(`
        INSERT INTO cast_photos (id, cast_id, photo_url, is_main, order_index)
        VALUES (?, ?, ?, 1, 0)
      `, [uuidv4(), castId, validatedData.profile_image]);
    }

    // 作成されたキャストを取得
    const castResult = await query('SELECT * FROM casts WHERE id = ?', [castId]);
    const result = castResult.rows[0] as unknown as Cast;

    console.info('キャスト作成完了', { castId: result.id, name: result.name });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'キャストが正常に作成されました'
    } as ApiResponse<Cast>, { status: 201 });
});