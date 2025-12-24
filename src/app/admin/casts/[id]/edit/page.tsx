"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

import MultiImageUploader from "@/components/MultiImageUploader";
import type { CastDetail } from "@/types";

interface UploadedImage {
  url: string;
  isMain: boolean;
}

interface Badge {
  id: string;
  name: string;
  color: string;
  display_order: number;
}

// フォーム用の型定義
interface CastFormData {
  name: string;
  age: number;
  height: number;
  blood_type: string;
  photos: UploadedImage[];
  description: string;
  stats: {
    looks: number;
    talk: number;
    drinking: number;
    intelligence: number;
    tension: number;
    special: number;
  };
  specialName: string;
  badgeIds: string[];
}

export default function EditCastPage() {
  const params = useParams();
  const castId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cast, setCast] = useState<CastDetail | null>(null);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [formData, setFormData] = useState<CastFormData>({
    name: "",
    age: 20,
    height: 160,
    blood_type: "A",
    photos: [],
    description: "",
    stats: {
      looks: 50,
      talk: 50,
      drinking: 50,
      intelligence: 50,
      tension: 50,
      special: 50,
    },
    specialName: '',
    badgeIds: [],
  });

  const fetchBadges = useCallback(async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const result = await response.json();
        setAvailableBadges(result.data || []);
      }
    } catch (error) {
      console.error("バッジ取得エラー", error);
    }
  }, []);

  const fetchCast = useCallback(async () => {
    try {
      const response = await fetch(`/api/casts/${castId}`);
      if (!response.ok) throw new Error("キャストの取得に失敗しました");
      const result = await response.json();
      const data = result.data;
      setCast(data);

      // 写真データを変換
      const photos: UploadedImage[] = (data.photos || []).map((photo: { photo_url: string; is_main: number | boolean }, index: number) => ({
        url: photo.photo_url,
        isMain: photo.is_main === 1 || photo.is_main === true || index === 0
      }));

      // 既存のバッジIDを取得
      const badgeIds = (data.badges || []).map((badge: Badge) => badge.id);

      setFormData({
        name: data.name,
        age: data.age,
        height: data.height,
        blood_type: data.blood_type || "A",
        photos,
        description: data.description || "",
        stats: data.stats ? {
          looks: data.stats.looks || 50,
          talk: data.stats.talk || 50,
          drinking: data.stats.alcohol_tolerance || 50,
          intelligence: data.stats.intelligence || 50,
          tension: data.stats.energy || 50,
          special: data.stats.custom_stat || 50,
        } : {
          looks: 50,
          talk: 50,
          drinking: 50,
          intelligence: 50,
          tension: 50,
          special: 50,
        },
        specialName: data.stats?.custom_stat_name || '',
        badgeIds,
      });
    } catch (error) {
      console.error("キャスト取得エラー", error);
      alert("キャストの取得に失敗しました");
      router.push("/admin/casts");
    } finally {
      setLoading(false);
    }
  }, [castId, router]);

  useEffect(() => {
    fetchBadges();
    fetchCast();
  }, [fetchBadges, fetchCast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("stats.")) {
      const statName = name.split(".")[1] as keyof CastFormData['stats'];
      setFormData((prev: CastFormData) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: parseInt(value) || 0,
        },
      }));
    } else if (name === "age" || name === "height") {
      setFormData((prev: CastFormData) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev: CastFormData) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleBadge = (badgeId: string) => {
    setFormData((prev: CastFormData) => ({
      ...prev,
      badgeIds: prev.badgeIds.includes(badgeId)
        ? prev.badgeIds.filter(id => id !== badgeId)
        : [...prev.badgeIds, badgeId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // メイン画像のURLを取得
      const mainPhoto = formData.photos.find(p => p.isMain) || formData.photos[0];
      const avatarUrl = mainPhoto?.url || "";

      const response = await fetch(`/api/casts/${castId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cast: {
            name: formData.name,
            age: formData.age,
            height: formData.height,
            description: formData.description,
            avatar_url: avatarUrl,
          },
          stats: {
            looks: formData.stats.looks,
            talk: formData.stats.talk,
            alcohol_tolerance: formData.stats.drinking,
            intelligence: formData.stats.intelligence,
            energy: formData.stats.tension,
            custom_stat: formData.stats.special,
            custom_stat_name: formData.specialName || null,
          },
          photos: formData.photos.map(p => p.url),
          badges: formData.badgeIds,
        }),
      });

      if (!response.ok) throw new Error("更新に失敗しました");

      console.info("キャスト更新成功", { id: castId });
      router.push("/admin/casts");
    } catch (error) {
      console.error("キャスト更新エラー", error);
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center">読み込み中...</div>;
  if (!cast) return <div className="text-center">キャストが見つかりません</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary-500)' }}>キャスト編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6 cast-card px-6 py-8">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            名前 <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md px-3 py-2"
            style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              年齢 <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="number"
              name="age"
              required
              min="18"
              max="99"
              value={formData.age}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              身長 (cm) <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="number"
              name="height"
              required
              min="140"
              max="200"
              value={formData.height}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            血液型 <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <select
            name="blood_type"
            required
            value={formData.blood_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md px-3 py-2"
            style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <option value="A">A型</option>
            <option value="B">B型</option>
            <option value="O">O型</option>
            <option value="AB">AB型</option>
          </select>
        </div>

        <div>
          <MultiImageUploader
            label="キャスト写真"
            value={formData.photos}
            onChange={(photos) => setFormData((prev: CastFormData) => ({ ...prev, photos }))}
            maxImages={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            自己紹介
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md px-3 py-2"
            style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* バッジ選択 */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>バッジ</h3>
          <div className="flex flex-wrap gap-2">
            {availableBadges.map((badge) => {
              const isSelected = formData.badgeIds.includes(badge.id);
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => toggleBadge(badge.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : 'opacity-50 hover:opacity-75'
                  }`}
                  style={{ backgroundColor: badge.color, color: '#fff' }}
                >
                  {badge.name}
                </button>
              );
            })}
          </div>
          {formData.badgeIds.length > 0 && (
            <p className="mt-2 text-sm" style={{ color: 'var(--accent-600)' }}>
              {formData.badgeIds.length}個のバッジを選択中
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>ステータス</h3>
          <div className="space-y-3">
            {(Object.entries(formData.stats) as [keyof CastFormData['stats'], number][]).map(([key, value]) => (
              <div key={key}>
                {key === "special" ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        name="specialName"
                        placeholder="項目名（例：ギャップ萌え）"
                        value={formData.specialName}
                        onChange={handleChange}
                        className="px-2 py-1 rounded text-sm w-40"
                        style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>: </span>
                      <span style={{ color: 'var(--primary-500)' }}>{value}</span>
                    </div>
                  </>
                ) : (
                  <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {key === "looks" && "ルックス"}
                    {key === "talk" && "トーク"}
                    {key === "drinking" && "酒の強さ"}
                    {key === "intelligence" && "頭脳"}
                    {key === "tension" && "テンション"}
                    : <span style={{ color: 'var(--primary-500)' }}>{value}</span>
                  </label>
                )}
                <input
                  type="range"
                  name={`stats.${key}`}
                  min="1"
                  max="100"
                  value={value}
                  onChange={handleChange}
                  className="mt-1 block w-full accent-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/casts")}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
