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
      setCasts(data.casts);
    } catch (error) {
      console.error("キャスト取得エラー", error);
      setError("キャストの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
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

  if (loading) return <div className="text-center">読み込み中...</div>;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">キャスト管理</h1>
        <Link
          href="/admin/casts/new"
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
        >
          新規登録
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                写真
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                年齢
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                身長
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                血液型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                バッジ
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {casts.map((cast) => (
              <tr key={cast.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={cast.profile_image || "/images/placeholder.png"}
                    alt={cast.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cast.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cast.age}歳
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cast.height}cm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cast.blood_type}型
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cast.badges?.length || 0}個
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/casts/${cast.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(cast.id)}
                    className="text-red-600 hover:text-red-900"
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