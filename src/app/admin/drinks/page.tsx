'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, GripVertical, Wine, Sparkles, GlassWater, Beer, Martini, LucideIcon } from 'lucide-react';

// アイコンの選択肢
const iconOptions: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'Wine', label: 'ワイン', Icon: Wine },
  { value: 'Beer', label: 'ビール', Icon: Beer },
  { value: 'Martini', label: 'カクテル', Icon: Martini },
  { value: 'GlassWater', label: 'グラス', Icon: GlassWater },
  { value: 'Sparkles', label: 'キラキラ', Icon: Sparkles },
];

// アイコン名からコンポーネントを取得
const getIconComponent = (iconName: string): LucideIcon => {
  const found = iconOptions.find(opt => opt.value === iconName);
  return found?.Icon || Wine;
};

interface Drink {
  id: string;
  category_id: string;
  name: string;
  price: number;
  note: string | null;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  name_en: string | null;
  icon: string;
  color: string;
  display_order: number;
  items: Drink[];
}

// 色の選択肢
const colorOptions = [
  { value: '#059669', label: '緑' },
  { value: '#d97706', label: 'オレンジ' },
  { value: '#dc2626', label: '赤' },
  { value: '#0891b2', label: '水色' },
  { value: '#eab308', label: '黄' },
  { value: '#7c2d12', label: '茶' },
  { value: '#6366f1', label: '紫' },
  { value: '#ec4899', label: 'ピンク' },
];

export default function DrinkMenuEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newDrinkCategory, setNewDrinkCategory] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);

  // 新規ドリンクフォーム
  const [newDrink, setNewDrink] = useState({ name: '', price: '', note: '' });
  // 新規カテゴリフォーム
  const [newCategory, setNewCategory] = useState({ name: '', name_en: '', color: '#6366f1', icon: 'Wine' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/drinks');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // カテゴリ追加
  const addCategory = async () => {
    if (!newCategory.name) return;
    try {
      const res = await fetch('/api/drinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', ...newCategory })
      });
      if (res.ok) {
        setNewCategory({ name: '', name_en: '', color: '#6366f1', icon: 'Wine' });
        setShowNewCategory(false);
        fetchData();
      }
    } catch (error) {
      console.error('追加エラー:', error);
    }
  };

  // ドリンク追加
  const addDrink = async (categoryId: string) => {
    if (!newDrink.name || !newDrink.price) return;
    try {
      const res = await fetch('/api/drinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drink',
          category_id: categoryId,
          name: newDrink.name,
          price: parseInt(newDrink.price),
          note: newDrink.note || null
        })
      });
      if (res.ok) {
        setNewDrink({ name: '', price: '', note: '' });
        setNewDrinkCategory(null);
        fetchData();
      }
    } catch (error) {
      console.error('追加エラー:', error);
    }
  };

  // ドリンク更新
  const updateDrink = async () => {
    if (!editingDrink) return;
    try {
      const res = await fetch('/api/drinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drink',
          id: editingDrink.id,
          name: editingDrink.name,
          price: editingDrink.price,
          note: editingDrink.note
        })
      });
      if (res.ok) {
        setEditingDrink(null);
        fetchData();
      }
    } catch (error) {
      console.error('更新エラー:', error);
    }
  };

  // カテゴリ更新
  const updateCategory = async () => {
    if (!editingCategory) return;
    try {
      const res = await fetch('/api/drinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          id: editingCategory.id,
          name: editingCategory.name,
          name_en: editingCategory.name_en,
          icon: editingCategory.icon,
          color: editingCategory.color
        })
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchData();
      }
    } catch (error) {
      console.error('更新エラー:', error);
    }
  };

  // 削除
  const deleteItem = async (type: 'category' | 'drink', id: string, name: string) => {
    const message = type === 'category'
      ? `「${name}」カテゴリとその中のドリンクを全て削除しますか？`
      : `「${name}」を削除しますか？`;

    if (!confirm(message)) return;

    try {
      const res = await fetch(`/api/drinks?type=${type}&id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>
          ドリンクメニュー編集
        </h1>
        <button
          onClick={() => setShowNewCategory(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          カテゴリ追加
        </button>
      </div>

      {/* 新規カテゴリフォーム */}
      {showNewCategory && (
        <div className="cast-card p-6 mb-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            新しいカテゴリ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="カテゴリ名（例：ビール）"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-4 py-3 rounded-lg text-lg"
              style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            <input
              type="text"
              placeholder="英語名（任意）"
              value={newCategory.name_en}
              onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value })}
              className="px-4 py-3 rounded-lg"
              style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="mb-4">
            <p className="text-sm mb-2" style={{ color: 'var(--accent-600)' }}>アイコン</p>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map(opt => {
                const IconComp = opt.Icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, icon: opt.value })}
                    className={`p-3 rounded-lg flex items-center gap-2 transition-all ${newCategory.icon === opt.value ? 'ring-2 ring-primary' : ''}`}
                    style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)' }}
                  >
                    <IconComp className="w-5 h-5" style={{ color: newCategory.color }} />
                    <span style={{ color: 'var(--foreground)' }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm mb-2" style={{ color: 'var(--accent-600)' }}>カラー</p>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, color: opt.value })}
                  className={`w-10 h-10 rounded-full transition-all ${newCategory.color === opt.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addCategory} className="btn-primary flex items-center gap-2">
              <Check className="w-5 h-5" />
              追加
            </button>
            <button onClick={() => setShowNewCategory(false)} className="btn-secondary flex items-center gap-2">
              <X className="w-5 h-5" />
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* カテゴリ一覧 */}
      {categories.length === 0 ? (
        <div className="cast-card p-8 text-center">
          <p style={{ color: 'var(--accent-600)' }}>
            まだカテゴリがありません。「カテゴリ追加」ボタンから始めましょう！
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="cast-card overflow-hidden">
              {/* カテゴリヘッダー */}
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: category.color + '20', borderBottom: '1px solid var(--border)' }}
              >
                {editingCategory?.id === category.id ? (
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="px-3 py-2 rounded flex-1"
                        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                      <button onClick={updateCategory} className="p-2 rounded-full bg-green-600 text-white">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingCategory(null)} className="p-2 rounded-full bg-gray-600 text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div className="flex gap-1">
                        {iconOptions.map(opt => {
                          const IconComp = opt.Icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setEditingCategory({ ...editingCategory, icon: opt.value })}
                              className={`p-2 rounded transition-all ${editingCategory.icon === opt.value ? 'ring-2 ring-primary bg-surface' : ''}`}
                              title={opt.label}
                            >
                              <IconComp className="w-5 h-5" style={{ color: editingCategory.color }} />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-1">
                        {colorOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEditingCategory({ ...editingCategory, color: opt.value })}
                            className={`w-8 h-8 rounded-full transition-all ${editingCategory.color === opt.value ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: opt.value }}
                            title={opt.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComp = getIconComponent(category.icon);
                        return <IconComp className="w-6 h-6" style={{ color: category.color }} />;
                      })()}
                      <h2 className="text-xl font-bold" style={{ color: category.color }}>
                        {category.name}
                      </h2>
                      {category.name_en && (
                        <span className="text-sm" style={{ color: 'var(--accent-600)' }}>
                          {category.name_en}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--accent-600)' }}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteItem('category', category.id, category.name)}
                        className="p-2 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ドリンク一覧 */}
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.items.map((drink) => (
                    <div
                      key={drink.id}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)' }}
                    >
                      {editingDrink?.id === drink.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingDrink.name}
                            onChange={(e) => setEditingDrink({ ...editingDrink, name: e.target.value })}
                            className="w-full px-3 py-2 rounded"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <input
                            type="number"
                            value={editingDrink.price}
                            onChange={(e) => setEditingDrink({ ...editingDrink, price: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <input
                            type="text"
                            value={editingDrink.note || ''}
                            onChange={(e) => setEditingDrink({ ...editingDrink, note: e.target.value })}
                            placeholder="備考（任意）"
                            className="w-full px-3 py-2 rounded"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <div className="flex gap-2">
                            <button onClick={updateDrink} className="flex-1 py-2 rounded bg-green-600 text-white font-bold">
                              保存
                            </button>
                            <button onClick={() => setEditingDrink(null)} className="flex-1 py-2 rounded bg-gray-600 text-white font-bold">
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold" style={{ color: 'var(--foreground)' }}>{drink.name}</span>
                            <span className="font-bold text-lg" style={{ color: category.color }}>
                              ¥{drink.price.toLocaleString()}
                            </span>
                          </div>
                          {drink.note && (
                            <p className="text-sm mb-2" style={{ color: 'var(--accent-600)' }}>{drink.note}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingDrink(drink)}
                              className="flex-1 py-2 rounded text-sm font-bold"
                              style={{ backgroundColor: 'var(--surface)', color: 'var(--primary-500)' }}
                            >
                              編集
                            </button>
                            <button
                              onClick={() => deleteItem('drink', drink.id, drink.name)}
                              className="flex-1 py-2 rounded text-sm font-bold bg-red-600/20 text-red-500"
                            >
                              削除
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* 新規ドリンク追加カード */}
                  {newDrinkCategory === category.id ? (
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-variant)', border: '2px dashed var(--primary-500)' }}
                    >
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="ドリンク名"
                          value={newDrink.name}
                          onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                          className="w-full px-3 py-2 rounded text-lg"
                          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          autoFocus
                        />
                        <input
                          type="number"
                          placeholder="価格（税込）"
                          value={newDrink.price}
                          onChange={(e) => setNewDrink({ ...newDrink, price: e.target.value })}
                          className="w-full px-3 py-2 rounded text-lg"
                          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                        <input
                          type="text"
                          placeholder="備考（任意）"
                          value={newDrink.note}
                          onChange={(e) => setNewDrink({ ...newDrink, note: e.target.value })}
                          className="w-full px-3 py-2 rounded"
                          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => addDrink(category.id)}
                            className="flex-1 py-2 rounded bg-green-600 text-white font-bold"
                          >
                            追加
                          </button>
                          <button
                            onClick={() => {
                              setNewDrinkCategory(null);
                              setNewDrink({ name: '', price: '', note: '' });
                            }}
                            className="flex-1 py-2 rounded bg-gray-600 text-white font-bold"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewDrinkCategory(category.id)}
                      className="p-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-variant)',
                        border: '2px dashed var(--border)',
                        color: 'var(--accent-600)'
                      }}
                    >
                      <Plus className="w-6 h-6" />
                      <span className="font-bold">ドリンク追加</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
