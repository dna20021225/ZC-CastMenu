"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import ImageUploader from "@/components/ImageUploader";
import type { Cast, UpdateCastInput } from "@/types";



export default function EditCastPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cast, setCast] = useState<Cast | null>(null);
  const [formData, setFormData] = useState<UpdateCastInput>({
    name: "",
    age: 20,
    height: 160,
    blood_type: "A",
    profile_image: "",
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

  useEffect(() => {
    fetchCast();
  }, [params.id]);

  const fetchCast = async () => {
    try {
      const response = await fetch(`/api/casts/${params.id}`);
      if (!response.ok) throw new Error("キャストの取得に失敗しました");
      const data = await response.json();
      setCast(data);
      setFormData({
        name: data.name,
        age: data.age,
        height: data.height,
        blood_type: data.blood_type,
        profile_image: data.profile_image || "",
        description: data.description || "",
        stats: data.stats || {
          looks: 50,
          talk: 50,
          drinking: 50,
          intelligence: 50,
          tension: 50,
          special: 50,
        },
      });
    } catch (error) {
      console.error("キャスト取得エラー", error);
      alert("キャストの取得に失敗しました");
      router.push("/admin/casts");
    } finally {
      setLoading(false);
    }
  };

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
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
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
    setSaving(true);

    try {
      const response = await fetch(`/api/casts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("更新に失敗しました");

      console.info("キャスト更新成功", { id: params.id });
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">キャスト編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-6 py-8 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              年齢 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              required
              min="18"
              max="99"
              value={formData.age}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              身長 (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="height"
              required
              min="140"
              max="200"
              value={formData.height}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            血液型 <span className="text-red-500">*</span>
          </label>
          <select
            name="blood_type"
            required
            value={formData.blood_type}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="A">A型</option>
            <option value="B">B型</option>
            <option value="O">O型</option>
            <option value="AB">AB型</option>
          </select>
        </div>

        <div>
          <ImageUploader
            label="プロフィール画像"
            value={formData.profile_image}
            onChange={(url) => setFormData(prev => ({ ...prev, profile_image: url }))}
            onRemove={() => setFormData(prev => ({ ...prev, profile_image: "" }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            自己紹介
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">ステータス</h3>
          <div className="space-y-3">
            {Object.entries(formData.stats).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">
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
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}