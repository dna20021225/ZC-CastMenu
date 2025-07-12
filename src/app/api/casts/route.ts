import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { createAPILogger } from '@/lib/logger/server';
import { 
  ApiResponse, 
  CastDetail, 
  CastListResponse, 
  CastSearchParams,
  CastFormData,
  CastStatsFormData 
} from '@/types/api';
import { Cast, CastPhoto, CastStats, Badge } from '@/types/database';

const logger = createAPILogger('casts-api');

// キャスト一覧取得 (GET /api/casts)
export async function GET(request: NextRequest) {
  try {
    logger.info('キャスト一覧取得開始');
    
    const { searchParams } = new URL(request.url);
    const params: CastSearchParams = {
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

    // WHERE句の構築
    const conditions: string[] = ['c.is_active = true'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (params.search) {
      conditions.push(`c.name ILIKE $${paramIndex}`);
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    if (params.age_min) {
      conditions.push(`c.age >= $${paramIndex}`);
      queryParams.push(params.age_min);
      paramIndex++;
    }

    if (params.age_max) {
      conditions.push(`c.age <= $${paramIndex}`);
      queryParams.push(params.age_max);
      paramIndex++;
    }

    if (params.height_min) {
      conditions.push(`c.height >= $${paramIndex}`);
      queryParams.push(params.height_min);
      paramIndex++;
    }

    if (params.height_max) {
      conditions.push(`c.height <= $${paramIndex}`);
      queryParams.push(params.height_max);
      paramIndex++;
    }

    // バッジフィルタ
    let badgeJoin = '';
    if (params.badges && params.badges.length > 0) {
      const placeholders = params.badges.map(() => `$${paramIndex++}`).join(',');
      queryParams.push(...params.badges);
      badgeJoin = `
        INNER JOIN cast_badges cb ON c.id = cb.cast_id
        INNER JOIN badges b ON cb.badge_id = b.id AND b.name IN (${placeholders})
      `;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // ソート
    const sortColumn = params.sort_by === 'created_at' ? 'c.created_at' : `c.${params.sort_by}`;
    const orderClause = `ORDER BY ${sortColumn} ${params.sort_order?.toUpperCase()}`;

    // ページネーション
    const offset = ((params.page || 1) - 1) * (params.limit || 20);
    queryParams.push(params.limit, offset);
    const paginationClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    // メインクエリ
    const castsQuery = `
      SELECT DISTINCT c.*
      FROM casts c
      ${badgeJoin}
      ${whereClause}
      ${orderClause}
      ${paginationClause}
    `;

    logger.debug('キャスト一覧クエリ実行', { query: castsQuery, params: queryParams });
    
    const castsResult = await query(castsQuery, queryParams) as { rows: Cast[] };
    const casts = castsResult.rows;

    // 各キャストの関連データを取得
    const castDetails: CastDetail[] = await Promise.all(
      casts.map(async (cast) => {
        // 写真を取得
        const photosResult = await query(
          'SELECT * FROM cast_photos WHERE cast_id = $1 ORDER BY order_index',
          [cast.id]
        ) as { rows: CastPhoto[] };

        // 能力値を取得
        const statsResult = await query(
          'SELECT * FROM cast_stats WHERE cast_id = $1',
          [cast.id]
        ) as { rows: CastStats[] };

        // バッジを取得
        const badgesResult = await query(`
          SELECT b.*, cb.assigned_at
          FROM badges b
          INNER JOIN cast_badges cb ON b.id = cb.badge_id
          WHERE cb.cast_id = $1
          ORDER BY b.display_order
        `, [cast.id]) as { rows: (Badge & { assigned_at: string })[] };

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
    
    const countResult = await query(countQuery, queryParams.slice(0, -2)) as { rows: [{ total: string }] };
    const total = parseInt(countResult.rows[0].total);

    const response: CastListResponse = {
      casts: castDetails,
      total,
      page: params.page || 1,
      limit: params.limit || 20
    };

    logger.info('キャスト一覧取得完了', { total, page: params.page, limit: params.limit });

    return NextResponse.json({
      success: true,
      data: response
    } as ApiResponse<CastListResponse>);

  } catch (error) {
    logger.error('キャスト一覧取得エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: 'キャスト一覧の取得に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}

// キャスト作成 (POST /api/casts)
export async function POST(request: NextRequest) {
  try {
    logger.info('キャスト作成開始');
    
    const body = await request.json() as {
      cast: CastFormData;
      stats: CastStatsFormData;
      photos?: string[];
      badges?: string[];
    };

    if (!body.cast || !body.stats) {
      return NextResponse.json({
        success: false,
        error: 'キャスト情報と能力値は必須です'
      } as ApiResponse, { status: 400 });
    }

    const result = await transaction(async (client) => {
      // キャスト基本情報を作成
      const castResult = await client.query(`
        INSERT INTO casts (name, age, height, hobby, description, avatar_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING *
      `, [
        body.cast.name,
        body.cast.age,
        body.cast.height,
        body.cast.hobby,
        body.cast.description,
        body.cast.avatar_url || null
      ]);

      const newCast = castResult.rows[0] as Cast;

      // 能力値を作成
      await client.query(`
        INSERT INTO cast_stats (cast_id, looks, talk, alcohol_tolerance, intelligence, energy, custom_stat, custom_stat_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        newCast.id,
        body.stats.looks,
        body.stats.talk,
        body.stats.alcohol_tolerance,
        body.stats.intelligence,
        body.stats.energy,
        body.stats.custom_stat || null,
        body.stats.custom_stat_name || null
      ]);

      // 写真を追加
      if (body.photos && body.photos.length > 0) {
        for (let i = 0; i < body.photos.length; i++) {
          await client.query(`
            INSERT INTO cast_photos (cast_id, photo_url, is_main, order_index)
            VALUES ($1, $2, $3, $4)
          `, [newCast.id, body.photos[i], i === 0, i]);
        }
      }

      // バッジを付与
      if (body.badges && body.badges.length > 0) {
        for (const badgeId of body.badges) {
          await client.query(`
            INSERT INTO cast_badges (cast_id, badge_id, assigned_by)
            VALUES ($1, $2, $3)
          `, [newCast.id, badgeId, 'system']); // TODO: 実際のユーザーIDに変更
        }
      }

      return newCast;
    });

    logger.info('キャスト作成完了', { castId: result.id, name: result.name });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'キャストが正常に作成されました'
    } as ApiResponse<Cast>, { status: 201 });

  } catch (error) {
    logger.error('キャスト作成エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: 'キャストの作成に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}