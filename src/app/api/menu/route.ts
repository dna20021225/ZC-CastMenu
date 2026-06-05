import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface MenuCategory {
  id: string;
  name: string;
  name_en: string | null;
  icon: string;
  color: string;
  display_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number;
  note: string | null;
  display_order: number;
  is_active: number;
}

// 一覧取得（カテゴリ＋項目）
export async function GET() {
  try {
    const categoriesResult = await query(
      'SELECT * FROM menu_categories ORDER BY display_order'
    ) as { rows: MenuCategory[] };

    const itemsResult = await query(
      'SELECT * FROM menu_items WHERE is_active = 1 ORDER BY display_order'
    ) as { rows: MenuItem[] };

    const categories = categoriesResult.rows.map(cat => ({
      ...cat,
      items: itemsResult.rows.filter(it => it.category_id === cat.id),
    }));

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('メニュー取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'メニューの取得に失敗しました',
    }, { status: 500 });
  }
}

// 作成（カテゴリ or 項目）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'category') {
      const { name, name_en, icon, color } = body;
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ success: false, error: 'カテゴリ名を入力してください' }, { status: 400 });
      }
      const id = uuidv4();
      const maxOrderResult = await query(
        'SELECT MAX(display_order) as max_order FROM menu_categories'
      ) as { rows: { max_order: number | null }[] };
      const displayOrder = (maxOrderResult.rows[0]?.max_order ?? -1) + 1;

      await query(
        `INSERT INTO menu_categories (id, name, name_en, icon, color, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name.trim(), name_en || null, icon || 'Tag', color || '#6366f1', displayOrder]
      );
      return NextResponse.json({
        success: true,
        data: { id, name: name.trim(), name_en, icon, color, display_order: displayOrder },
      }, { status: 201 });
    }

    if (type === 'item') {
      const { category_id, name, price, note } = body;
      if (typeof category_id !== 'string' || category_id.trim() === '') {
        return NextResponse.json({ success: false, error: 'カテゴリIDが必要です' }, { status: 400 });
      }
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ success: false, error: '項目名を入力してください' }, { status: 400 });
      }
      const parsedPrice = typeof price === 'number' ? price : parseInt(String(price), 10);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ success: false, error: '価格は0以上の整数で入力してください' }, { status: 400 });
      }

      const id = uuidv4();
      const maxOrderResult = await query(
        'SELECT MAX(display_order) as max_order FROM menu_items WHERE category_id = ?',
        [category_id]
      ) as { rows: { max_order: number | null }[] };
      const displayOrder = (maxOrderResult.rows[0]?.max_order ?? -1) + 1;

      await query(
        `INSERT INTO menu_items (id, category_id, name, price, note, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, category_id, name.trim(), parsedPrice, note || null, displayOrder]
      );
      return NextResponse.json({
        success: true,
        data: { id, category_id, name: name.trim(), price: parsedPrice, note: note || null, display_order: displayOrder },
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: '無効なタイプです' }, { status: 400 });
  } catch (error) {
    console.error('メニュー作成エラー:', error);
    return NextResponse.json({ success: false, error: '作成に失敗しました' }, { status: 500 });
  }
}

// 更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (type === 'category') {
      const { name, name_en, icon, color } = body;
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ success: false, error: 'カテゴリ名を入力してください' }, { status: 400 });
      }
      await query(
        `UPDATE menu_categories
         SET name = ?, name_en = ?, icon = ?, color = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [name.trim(), name_en || null, icon, color, id]
      );
    } else if (type === 'item') {
      const { name, price, note } = body;
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ success: false, error: '項目名を入力してください' }, { status: 400 });
      }
      const parsedPrice = typeof price === 'number' ? price : parseInt(String(price), 10);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ success: false, error: '価格は0以上の整数で入力してください' }, { status: 400 });
      }
      await query(
        `UPDATE menu_items
         SET name = ?, price = ?, note = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [name.trim(), parsedPrice, note || null, id]
      );
    } else if (type === 'reorder-categories') {
      const { orders } = body;
      if (!Array.isArray(orders)) {
        return NextResponse.json({ success: false, error: 'orders は配列で指定してください' }, { status: 400 });
      }
      for (const item of orders) {
        await query(
          'UPDATE menu_categories SET display_order = ? WHERE id = ?',
          [item.display_order, item.id]
        );
      }
    } else if (type === 'reorder-items') {
      const { orders } = body;
      if (!Array.isArray(orders)) {
        return NextResponse.json({ success: false, error: 'orders は配列で指定してください' }, { status: 400 });
      }
      for (const item of orders) {
        await query(
          'UPDATE menu_items SET display_order = ? WHERE id = ?',
          [item.display_order, item.id]
        );
      }
    } else {
      return NextResponse.json({ success: false, error: '無効なタイプです' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('メニュー更新エラー:', error);
    return NextResponse.json({ success: false, error: '更新に失敗しました' }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'パラメータが不足しています' }, { status: 400 });
    }

    if (type === 'category') {
      // カテゴリ内の項目も削除
      await query('DELETE FROM menu_items WHERE category_id = ?', [id]);
      await query('DELETE FROM menu_categories WHERE id = ?', [id]);
    } else if (type === 'item') {
      await query('DELETE FROM menu_items WHERE id = ?', [id]);
    } else {
      return NextResponse.json({ success: false, error: '無効なタイプです' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('メニュー削除エラー:', error);
    return NextResponse.json({ success: false, error: '削除に失敗しました' }, { status: 500 });
  }
}
