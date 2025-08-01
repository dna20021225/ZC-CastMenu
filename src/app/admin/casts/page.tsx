"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Cast } from "@/types";



export default function AdminCastsPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await fetch("/api/casts");
      if (!response.ok) throw new Error("キャストの取得に失敗しました");
      const data = await response.json();
      setCasts(data.data?.casts || []);
    } catch (error) {
      console.error("キャスト取得エラー", error);
      setError("キャストの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) return;

    try {
      const response = await fetch(`/api/casts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("削除に失敗しました");

      console.info("キャスト削除成功", { id });
      fetchCasts();
    } catch (error) {
      console.error("キャスト削除エラー", error);
      alert("削除に失敗しました");
    }
  };

  if (loading) return <div className="text-center loading-spinner mx-auto"></div>;
  if (error) return <div className="error-message text-center">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>キャスト管理</h1>
        <Link
          href="/admin/casts/new"
          className="btn-primary"
        >
          新規登録
        </Link>
      </div>

      <div className="cast-card overflow-hidden">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
          <thead style={{ backgroundColor: 'var(--surface-variant)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                写真
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                名前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                年齢
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                身長
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                バッジ
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--surface)' }} className="divide-y" style-border-color="var(--border)">
            {casts.map((cast) => (
              <tr key={cast.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={cast.avatar_url || "/images/placeholder.png"}
                    alt={cast.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {cast.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary)' }}>
                  {cast.age}歳
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary)' }}>
                  {cast.height}cm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary)' }}>
                  {cast.badges?.length || 0}個
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/casts/${cast.id}/edit`}
                    className="text-primary hover:text-primary/80 mr-4"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(cast.id)}
                    style={{ color: 'var(--error)' }} className="hover:text-red-700"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}