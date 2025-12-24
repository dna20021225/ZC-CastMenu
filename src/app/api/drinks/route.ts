import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface DrinkCategory {
  id: string;
  name: string;
  name_en: string | null;
  icon: string;
  color: string;
  display_order: number;
}

interface Drink {
  id: string;
  category_id: string;
  name: string;
  price: number;
  note: string | null;
  display_order: number;
  is_active: number;
}

// カテゴリとドリンク一覧取得
export async function GET() {
  try {
    const categoriesResult = await query(
      'SELECT * FROM drink_categories ORDER BY display_order'
    ) as { rows: DrinkCategory[] };

    const drinksResult = await query(
      'SELECT * FROM drinks WHERE is_active = 1 ORDER BY display_order'
    ) as { rows: Drink[] };

    // カテゴリごとにドリンクをグループ化
    const categories = categoriesResult.rows.map(cat => ({
      ...cat,
      items: drinksResult.rows.filter(d => d.category_id === cat.id)
    }));

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('ドリンク取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'ドリンクの取得に失敗しました'
    }, { status: 500 });
  }
}

// カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'category') {
      const { name, name_en, icon, color } = body;
      const id = uuidv4();

      // 最大display_orderを取得
      const maxOrderResult = await query(
        'SELECT MAX(display_order) as max_order FROM drink_categories'
      ) as { rows: { max_order: number | null }[] };
      const displayOrder = (maxOrderResult.rows[0]?.max_order ?? -1) + 1;

      await query(
        `INSERT INTO drink_categories (id, name, name_en, icon, color, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, name_en || null, icon || 'Wine', color || '#6366f1', displayOrder]
      );

      return NextResponse.json({
        success: true,
        data: { id, name, name_en, icon, color, display_order: displayOrder }
      }, { status: 201 });
    }

    if (type === 'drink') {
      const { category_id, name, price, note } = body;
      const id = uuidv4();

      // 最大display_orderを取得
      const maxOrderResult = await query(
        'SELECT MAX(display_order) as max_order FROM drinks WHERE category_id = ?',
        [category_id]
      ) as { rows: { max_order: number | null }[] };
      const displayOrder = (maxOrderResult.rows[0]?.max_order ?? -1) + 1;

      await query(
        `INSERT INTO drinks (id, category_id, name, price, note, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, category_id, name, price, note || null, displayOrder]
      );

      return NextResponse.json({
        success: true,
        data: { id, category_id, name, price, note, display_order: displayOrder }
      }, { status: 201 });
    }

    return NextResponse.json({
      success: false,
      error: '無効なタイプです'
    }, { status: 400 });
  } catch (error) {
    console.error('作成エラー:', error);
    return NextResponse.json({
      success: false,
      error: '作成に失敗しました'
    }, { status: 500 });
  }
}

// 更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (type === 'category') {
      const { name, name_en, icon, color } = body;
      await query(
        `UPDATE drink_categories SET name = ?, name_en = ?, icon = ?, color = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [name, name_en || null, icon, color, id]
      );
    } else if (type === 'drink') {
      const { name, price, note } = body;
      await query(
        `UPDATE drinks SET name = ?, price = ?, note = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [name, price, note || null, id]
      );
    } else if (type === 'reorder-categories') {
      const { orders } = body; // [{ id, display_order }]
      for (const item of orders) {
        await query(
          'UPDATE drink_categories SET display_order = ? WHERE id = ?',
          [item.display_order, item.id]
        );
      }
    } else if (type === 'reorder-drinks') {
      const { orders } = body;
      for (const item of orders) {
        await query(
          'UPDATE drinks SET display_order = ? WHERE id = ?',
          [item.display_order, item.id]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新エラー:', error);
    return NextResponse.json({
      success: false,
      error: '更新に失敗しました'
    }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({
        success: false,
        error: 'パラメータが不足しています'
      }, { status: 400 });
    }

    if (type === 'category') {
      // カテゴリ内のドリンクも削除
      await query('DELETE FROM drinks WHERE category_id = ?', [id]);
      await query('DELETE FROM drink_categories WHERE id = ?', [id]);
    } else if (type === 'drink') {
      await query('DELETE FROM drinks WHERE id = ?', [id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('削除エラー:', error);
    return NextResponse.json({
      success: false,
      error: '削除に失敗しました'
    }, { status: 500 });
  }
}
