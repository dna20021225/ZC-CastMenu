import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { createAPILogger } from '@/lib/logger/server';
import { 
  ApiResponse, 
  CastDetail,
  CastFormData,
  CastStatsFormData 
} from '@/types/api';
import { Cast, CastPhoto, CastStats, Badge } from '@/types/database';

// Logger initialization moved

// キャスト詳細取得 (GET /api/casts/[id])
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    console.info('キャスト詳細取得開始', { castId: params.id });

    // キャスト基本情報を取得
    const castResult = await query(
      'SELECT * FROM casts WHERE id = $1 AND is_active = true',
      [params.id]
    ) as { rows: Cast[] };

    if (castResult.rows.length === 0) {
      console.warn('キャストが見つかりません', { castId: params.id });
      return NextResponse.json({
        success: false,
        error: 'キャストが見つかりません'
      } as ApiResponse, { status: 404 });
    }

    const cast = castResult.rows[0];

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

    const castDetail: CastDetail = {
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

    console.info('キャスト詳細取得完了', { castId: params.id, name: cast.name });

    return NextResponse.json({
      success: true,
      data: castDetail
    } as ApiResponse<CastDetail>);

  } catch (error) {
    console.error('キャスト詳細取得エラー', error instanceof Error ? error : new Error(String(error)), { castId: params.id });
    return NextResponse.json({
      success: false,
      error: 'キャスト詳細の取得に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}

// キャスト更新 (PUT /api/casts/[id])
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    console.info('キャスト更新開始', { castId: params.id });

    const body = await request.json() as {
      cast?: Partial<CastFormData>;
      stats?: Partial<CastStatsFormData>;
      photos?: string[];
      badges?: string[];
    };

    const result = await transaction(async (client) => {
      // キャストの存在確認
      const existingCastResult = await client.query(
        'SELECT * FROM casts WHERE id = $1 AND is_active = true',
        [params.id]
      );

      if (existingCastResult.rows.length === 0) {
        throw new Error('キャストが見つかりません');
      }

      let updatedCast = existingCastResult.rows[0] as Cast;

      // キャスト基本情報を更新
      if (body.cast) {
        const updateFields: string[] = [];
        const updateValues: unknown[] = [];
        let paramIndex = 1;

        if (body.cast.name !== undefined) {
          updateFields.push(`name = $${paramIndex++}`);
          updateValues.push(body.cast.name);
        }
        if (body.cast.age !== undefined) {
          updateFields.push(`age = $${paramIndex++}`);
          updateValues.push(body.cast.age);
        }
        if (body.cast.height !== undefined) {
          updateFields.push(`height = $${paramIndex++}`);
          updateValues.push(body.cast.height);
        }
        if (body.cast.hobby !== undefined) {
          updateFields.push(`hobby = $${paramIndex++}`);
          updateValues.push(body.cast.hobby);
        }
        if (body.cast.description !== undefined) {
          updateFields.push(`description = $${paramIndex++}`);
          updateValues.push(body.cast.description);
        }
        if (body.cast.avatar_url !== undefined) {
          updateFields.push(`avatar_url = $${paramIndex++}`);
          updateValues.push(body.cast.avatar_url);
        }

        if (updateFields.length > 0) {
          updateFields.push(`updated_at = NOW()`);
          updateValues.push(params.id);

          const updateQuery = `
            UPDATE casts 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
          `;

          const updateResult = await client.query(updateQuery, updateValues);
          updatedCast = updateResult.rows[0] as Cast;
        }
      }

      // 能力値を更新
      if (body.stats) {
        const updateFields: string[] = [];
        const updateValues: unknown[] = [];
        let paramIndex = 1;

        if (body.stats.looks !== undefined) {
          updateFields.push(`looks = $${paramIndex++}`);
          updateValues.push(body.stats.looks);
        }
        if (body.stats.talk !== undefined) {
          updateFields.push(`talk = $${paramIndex++}`);
          updateValues.push(body.stats.talk);
        }
        if (body.stats.alcohol_tolerance !== undefined) {
          updateFields.push(`alcohol_tolerance = $${paramIndex++}`);
          updateValues.push(body.stats.alcohol_tolerance);
        }
        if (body.stats.intelligence !== undefined) {
          updateFields.push(`intelligence = $${paramIndex++}`);
          updateValues.push(body.stats.intelligence);
        }
        if (body.stats.energy !== undefined) {
          updateFields.push(`energy = $${paramIndex++}`);
          updateValues.push(body.stats.energy);
        }
        if (body.stats.custom_stat !== undefined) {
          updateFields.push(`custom_stat = $${paramIndex++}`);
          updateValues.push(body.stats.custom_stat);
        }
        if (body.stats.custom_stat_name !== undefined) {
          updateFields.push(`custom_stat_name = $${paramIndex++}`);
          updateValues.push(body.stats.custom_stat_name);
        }

        if (updateFields.length > 0) {
          updateFields.push(`updated_at = NOW()`);
          updateValues.push(params.id);

          const statsUpdateQuery = `
            UPDATE cast_stats 
            SET ${updateFields.join(', ')}
            WHERE cast_id = $${paramIndex}
          `;

          await client.query(statsUpdateQuery, updateValues);
        }
      }

      // 写真を更新（完全置換）
      if (body.photos !== undefined) {
        // 既存の写真を削除
        await client.query('DELETE FROM cast_photos WHERE cast_id = $1', [params.id]);

        // 新しい写真を追加
        if (body.photos.length > 0) {
          for (let i = 0; i < body.photos.length; i++) {
            await client.query(`
              INSERT INTO cast_photos (cast_id, photo_url, is_main, order_index)
              VALUES ($1, $2, $3, $4)
            `, [params.id, body.photos[i], i === 0, i]);
          }
        }
      }

      // バッジを更新（完全置換）
      if (body.badges !== undefined) {
        // 既存のバッジを削除
        await client.query('DELETE FROM cast_badges WHERE cast_id = $1', [params.id]);

        // 新しいバッジを追加
        if (body.badges.length > 0) {
          for (const badgeId of body.badges) {
            await client.query(`
              INSERT INTO cast_badges (cast_id, badge_id, assigned_by)
              VALUES ($1, $2, $3)
            `, [params.id, badgeId, 'system']); // TODO: 実際のユーザーIDに変更
          }
        }
      }

      return updatedCast;
    });

    console.info('キャスト更新完了', { castId: params.id, name: result.name });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'キャストが正常に更新されました'
    } as ApiResponse<Cast>);

  } catch (error) {
    console.error('キャスト更新エラー', error instanceof Error ? error : new Error(String(error)), { castId: params.id });
    
    if (error instanceof Error && error.message === 'キャストが見つかりません') {
      return NextResponse.json({
        success: false,
        error: error.message
      } as ApiResponse, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: 'キャストの更新に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}

// キャスト削除 (DELETE /api/casts/[id])
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    console.info('キャスト削除開始', { castId: params.id });

    const result = await transaction(async (client) => {
      // キャストの存在確認
      const existingCastResult = await client.query(
        'SELECT * FROM casts WHERE id = $1 AND is_active = true',
        [params.id]
      );

      if (existingCastResult.rows.length === 0) {
        throw new Error('キャストが見つかりません');
      }

      const cast = existingCastResult.rows[0] as Cast;

      // 論理削除（is_activeをfalseに設定）
      await client.query(
        'UPDATE casts SET is_active = false, updated_at = NOW() WHERE id = $1',
        [params.id]
      );

      // 関連データも無効化
      await client.query('DELETE FROM cast_badges WHERE cast_id = $1', [params.id]);

      return cast;
    });

    console.info('キャスト削除完了', { castId: params.id, name: result.name });

    return NextResponse.json({
      success: true,
      message: 'キャストが正常に削除されました'
    } as ApiResponse);

  } catch (error) {
    console.error('キャスト削除エラー', error instanceof Error ? error : new Error(String(error)), { castId: params.id });
    
    if (error instanceof Error && error.message === 'キャストが見つかりません') {
      return NextResponse.json({
        success: false,
        error: error.message
      } as ApiResponse, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: 'キャストの削除に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}