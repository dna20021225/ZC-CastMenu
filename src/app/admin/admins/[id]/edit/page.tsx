"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";




interface Admin {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}

export default function EditAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const fetchAdmin = useCallback(async () => {
    try {
      const response = await fetch(`/api/admins/${params.id}`);
      if (!response.ok) throw new Error("管理者情報の取得に失敗しました");
      const data = await response.json();
      setAdmin(data.data);
      setFormData({
        username: data.data.username,
        email: data.data.email,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("管理者情報取得エラー", error);
      alert("管理者情報の取得に失敗しました");
      router.push("/admin/admins");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        alert("パスワードが一致しません");
        return;
      }
      if (formData.password.length < 8) {
        alert("パスワードは8文字以上で設定してください");
        return;
      }
    }

    setSaving(true);

    try {
      const updateData: Record<string, string> = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admins/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "更新に失敗しました");
      }

      console.info("管理者更新成功", { id: params.id, username: formData.username });
      router.push("/admin/admins");
    } catch (error) {
      console.error("管理者更新エラー", error);
      alert(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center">読み込み中...</div>;
  if (!admin) return <div className="text-center">管理者が見つかりません</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">管理者編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-6 py-8 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ユーザー名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            新しいパスワード
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
          <p className="mt-1 text-sm text-gray-500">変更する場合のみ入力してください（8文字以上）</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            新しいパスワード（確認）
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/admins")}
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