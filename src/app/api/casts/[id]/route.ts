import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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
      'SELECT * FROM casts WHERE id = ? AND is_active = 1',
      [params.id]
    ) as unknown as { rows: Cast[] };

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

    // キャストの存在確認
    const existingCastResult = await query(
      'SELECT * FROM casts WHERE id = ? AND is_active = 1',
      [params.id]
    ) as unknown as { rows: Cast[] };

    if (existingCastResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'キャストが見つかりません'
      } as ApiResponse, { status: 404 });
    }

    let updatedCast = existingCastResult.rows[0];

    // キャスト基本情報を更新
    if (body.cast) {
      const updateFields: string[] = [];
      const updateValues: unknown[] = [];

      if (body.cast.name !== undefined) {
        updateFields.push(`name = ?`);
        updateValues.push(body.cast.name);
      }
      if (body.cast.age !== undefined) {
        updateFields.push(`age = ?`);
        updateValues.push(body.cast.age);
      }
      if (body.cast.height !== undefined) {
        updateFields.push(`height = ?`);
        updateValues.push(body.cast.height);
      }
      if (body.cast.blood_type !== undefined) {
        updateFields.push(`blood_type = ?`);
        updateValues.push(body.cast.blood_type);
      }
      if (body.cast.hobby !== undefined) {
        updateFields.push(`hobby = ?`);
        updateValues.push(body.cast.hobby);
      }
      if (body.cast.description !== undefined) {
        updateFields.push(`description = ?`);
        updateValues.push(body.cast.description);
      }
      if (body.cast.avatar_url !== undefined) {
        // 空文字列は null として保存（画像クリアを正規ルートとして許容）
        updateFields.push(`avatar_url = ?`);
        updateValues.push(body.cast.avatar_url || null);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = datetime('now')`);
        updateValues.push(params.id);

        const updateQuery = `
          UPDATE casts
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;

        await query(updateQuery, updateValues);

        const updatedResult = await query(
          'SELECT * FROM casts WHERE id = ?',
          [params.id]
        ) as unknown as { rows: Cast[] };
        updatedCast = updatedResult.rows[0];
      }
    }

    // 能力値を更新（UPSERT: レコードが無ければINSERT、あればUPDATE）
    if (body.stats) {
      // 既存レコードの有無を確認
      const existingStats = await query(
        'SELECT cast_id FROM cast_stats WHERE cast_id = ?',
        [params.id]
      ) as unknown as { rows: { cast_id: string }[] };

      // CHECK制約 (>= 1) に違反する 0 や負の値は 1 にクランプ
      const clamp = (v: number | undefined | null): number => {
        if (v === undefined || v === null) return 50;
        return Math.max(1, Math.min(100, v));
      };

      const looks = body.stats.looks !== undefined ? clamp(body.stats.looks) : null;
      const talk = body.stats.talk !== undefined ? clamp(body.stats.talk) : null;
      const alcohol_tolerance = body.stats.alcohol_tolerance !== undefined ? clamp(body.stats.alcohol_tolerance) : null;
      const intelligence = body.stats.intelligence !== undefined ? clamp(body.stats.intelligence) : null;
      const energy = body.stats.energy !== undefined ? clamp(body.stats.energy) : null;
      const custom_stat = body.stats.custom_stat !== undefined && body.stats.custom_stat !== null
        ? clamp(body.stats.custom_stat) : null;
      const custom_stat_name = body.stats.custom_stat_name !== undefined ? body.stats.custom_stat_name : null;

      if (existingStats.rows.length === 0) {
        // INSERT: 必須項目はNOT NULL CHECK制約あり。未指定なら 50 で埋める
        await query(
          `INSERT INTO cast_stats (cast_id, looks, talk, alcohol_tolerance, intelligence, energy, custom_stat, custom_stat_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            params.id,
            looks ?? 50,
            talk ?? 50,
            alcohol_tolerance ?? 50,
            intelligence ?? 50,
            energy ?? 50,
            custom_stat,
            custom_stat_name,
          ]
        );
        console.info('cast_stats INSERT 完了', { castId: params.id });
      } else {
        // UPDATE: 指定された項目のみ更新
        const updateFields: string[] = [];
        const updateValues: unknown[] = [];

        if (looks !== null) { updateFields.push('looks = ?'); updateValues.push(looks); }
        if (talk !== null) { updateFields.push('talk = ?'); updateValues.push(talk); }
        if (alcohol_tolerance !== null) { updateFields.push('alcohol_tolerance = ?'); updateValues.push(alcohol_tolerance); }
        if (intelligence !== null) { updateFields.push('intelligence = ?'); updateValues.push(intelligence); }
        if (energy !== null) { updateFields.push('energy = ?'); updateValues.push(energy); }
        if (body.stats.custom_stat !== undefined) { updateFields.push('custom_stat = ?'); updateValues.push(custom_stat); }
        if (body.stats.custom_stat_name !== undefined) { updateFields.push('custom_stat_name = ?'); updateValues.push(custom_stat_name); }

        if (updateFields.length > 0) {
          updateFields.push(`updated_at = datetime('now')`);
          updateValues.push(params.id);
          await query(
            `UPDATE cast_stats SET ${updateFields.join(', ')} WHERE cast_id = ?`,
            updateValues
          );
        }
      }
    }

    // 写真を更新（完全置換）
    if (body.photos !== undefined) {
      await query('DELETE FROM cast_photos WHERE cast_id = ?', [params.id]);

      if (body.photos.length > 0) {
        for (let i = 0; i < body.photos.length; i++) {
          await query(`
            INSERT INTO cast_photos (id, cast_id, photo_url, is_main, order_index)
            VALUES (?, ?, ?, ?, ?)
          `, [crypto.randomUUID(), params.id, body.photos[i], i === 0 ? 1 : 0, i]);
        }
      } else if (body.cast?.avatar_url) {
        // photos配列が空でもavatar_urlが指定されていれば、最低1枚は保証する
        await query(`
          INSERT INTO cast_photos (id, cast_id, photo_url, is_main, order_index)
          VALUES (?, ?, ?, 1, 0)
        `, [crypto.randomUUID(), params.id, body.cast.avatar_url]);
      }
    }

    // バッジを更新（完全置換）
    if (body.badges !== undefined) {
      // No.1, No.2, No.3 バッジは排他的（1人のみ）
      // 他のキャストから該当バッジを削除
      if (body.badges.length > 0) {
        const exclusiveBadges = await query(`
          SELECT id FROM badges WHERE name IN ('No.1', 'No.2', 'No.3')
        `) as unknown as { rows: { id: string }[] };

        const exclusiveBadgeIds = exclusiveBadges.rows.map(b => b.id);
        const badgesToMakeExclusive = body.badges.filter(id => exclusiveBadgeIds.includes(id));

        for (const badgeId of badgesToMakeExclusive) {
          await query(`
            DELETE FROM cast_badges WHERE badge_id = ? AND cast_id != ?
          `, [badgeId, params.id]);
        }
      }

      await query('DELETE FROM cast_badges WHERE cast_id = ?', [params.id]);

      if (body.badges.length > 0) {
        for (const badgeId of body.badges) {
          await query(`
            INSERT INTO cast_badges (cast_id, badge_id, assigned_by)
            VALUES (?, ?, ?)
          `, [params.id, badgeId, 'system']);
        }
      }
    }

    console.info('キャスト更新完了', { castId: params.id, name: updatedCast.name });

    return NextResponse.json({
      success: true,
      data: updatedCast,
      message: 'キャストが正常に更新されました'
    } as ApiResponse<Cast>);

  } catch (error) {
    console.error('キャスト更新エラー', error instanceof Error ? error : new Error(String(error)), { castId: params.id });

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

    // キャストの存在確認
    const existingCastResult = await query(
      'SELECT * FROM casts WHERE id = ? AND is_active = 1',
      [params.id]
    ) as unknown as { rows: Cast[] };

    if (existingCastResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'キャストが見つかりません'
      } as ApiResponse, { status: 404 });
    }

    const cast = existingCastResult.rows[0];

    // 論理削除（is_activeを0に設定）
    await query(
      "UPDATE casts SET is_active = 0, updated_at = datetime('now') WHERE id = ?",
      [params.id]
    );

    // 関連データも無効化
    await query('DELETE FROM cast_badges WHERE cast_id = ?', [params.id]);

    console.info('キャスト削除完了', { castId: params.id, name: cast.name });

    return NextResponse.json({
      success: true,
      message: 'キャストが正常に削除されました'
    } as ApiResponse);

  } catch (error) {
    console.error('キャスト削除エラー', error instanceof Error ? error : new Error(String(error)), { castId: params.id });

    return NextResponse.json({
      success: false,
      error: 'キャストの削除に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}