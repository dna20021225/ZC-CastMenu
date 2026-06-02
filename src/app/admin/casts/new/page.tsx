"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import MultiImageUploader from "@/components/MultiImageUploader";

interface UploadedImage {
  url: string;
  isMain: boolean;
}



interface CastFormData {
  name: string;
  age: number | null;
  height: number | null;
  blood_type: string; // '' = 非公開
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
}

export default function NewCastPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<CastFormData>({
    name: "",
    age: null,
    height: null,
    blood_type: "",
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("stats.")) {
      const statName = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: parseInt(value) || 0,
        },
      }));
    } else if (name === "age" || name === "height") {
      const parsed = value === "" ? null : parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        [name]: parsed !== null && Number.isNaN(parsed) ? prev[name] : parsed,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // クライアント側バリデーション: 名前必須
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: '名前を入力してください' });
      (document.querySelector('input[name="name"]') as HTMLInputElement | null)?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      // メイン画像のURLを取得
      const mainPhoto = formData.photos.find(p => p.isMain) || formData.photos[0];
      const profileImage = mainPhoto?.url || "";

      const response = await fetch("/api/casts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          height: formData.height,
          blood_type: formData.blood_type === "" ? null : formData.blood_type,
          profile_image: profileImage,
          description: formData.description,
          stats: formData.stats,
          photos: formData.photos.map(p => p.url),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        let message = result?.error || result?.message || `登録に失敗しました (HTTP ${response.status})`;
        // zodバリデーションエラーの詳細を結合
        if (result?.details && typeof result.details === 'object') {
          const detailMessages = Object.entries(result.details as Record<string, string[]>)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' / ');
          if (detailMessages) message = `${message} (${detailMessages})`;
        }
        throw new Error(message);
      }

      console.info("キャスト登録成功", { id: result?.data?.id });
      setFeedback({ type: 'success', message: '登録しました' });
      setTimeout(() => router.push("/admin/casts"), 700);
    } catch (error) {
      const message = error instanceof Error ? error.message : '登録に失敗しました';
      console.error("キャスト登録エラー", error);
      setFeedback({ type: 'error', message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto tablet-layout">
      <AdminHeader title="キャスト新規登録" backHref="/admin/casts" />

      {feedback && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-md text-sm font-medium"
          style={{
            backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: feedback.type === 'success' ? 'rgb(22,163,74)' : 'rgb(220,38,38)',
            border: `1px solid ${feedback.type === 'success' ? 'rgb(22,163,74)' : 'rgb(220,38,38)'}`,
          }}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8 rounded-lg" style={{
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-medium)',
        borderRadius: 'var(--border-radius)'
      }}>
        <div>
          <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            名前 <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              borderRadius: 'var(--border-radius)'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              年齢
              <span className="ml-1 text-xs" style={{ color: 'var(--secondary)' }}>（空欄で非公開）</span>
            </label>
            <input
              type="number"
              name="age"
              placeholder="非公開"
              value={formData.age ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                borderRadius: 'var(--border-radius)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              身長 (cm)
              <span className="ml-1 text-xs" style={{ color: 'var(--secondary)' }}>（空欄で非公開）</span>
            </label>
            <input
              type="number"
              name="height"
              placeholder="非公開"
              value={formData.height ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                borderRadius: 'var(--border-radius)'
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            血液型
          </label>
          <select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              borderRadius: 'var(--border-radius)'
            }}
          >
            <option value="">非公開</option>
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
            onChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
            maxImages={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            自己紹介
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              borderRadius: 'var(--border-radius)'
            }}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>ステータス</h3>
          <div className="space-y-3">
            {Object.entries(formData.stats).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {key === "looks" && "ルックス"}
                  {key === "talk" && "トーク"}
                  {key === "drinking" && "酒の強さ"}
                  {key === "intelligence" && "頭脳"}
                  {key === "tension" && "テンション"}
                  {key === "special" && "スペシャル"}
                  : {value}
                </label>
                <input
                  type="range"
                  name={`stats.${key}`}
                  min="1"
                  max="100"
                  value={value}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/casts")}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}