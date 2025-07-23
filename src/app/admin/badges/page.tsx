"use client";

import { useState, useEffect } from "react";
import { createClientLogger } from "@/lib/logger/client";
import type { Cast, Badge } from "@/types";

const logger = createClientLogger();

export default function AdminBadgesPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCastId, setSelectedCastId] = useState<number | null>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchCasts(), fetchBadges()]).finally(() => setLoading(false));
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await fetch("/api/casts");
      if (!response.ok) throw new Error("キャストの取得に失敗しました");
      const data = await response.json();
      setCasts(data.casts);
    } catch (error) {
      logger.error("キャスト取得エラー", error);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/badges");
      if (!response.ok) throw new Error("バッジの取得に失敗しました");
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      logger.error("バッジ取得エラー", error);
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedCastId || !selectedBadgeId) {
      alert("キャストとバッジを選択してください");
      return;
    }

    try {
      const response = await fetch(`/api/casts/${selectedCastId}/badges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ badge_id: selectedBadgeId }),
      });

      if (!response.ok) throw new Error("バッジの付与に失敗しました");

      logger.info("バッジ付与成功", { castId: selectedCastId, badgeId: selectedBadgeId });
      alert("バッジを付与しました");
      fetchCasts();
    } catch (error) {
      logger.error("バッジ付与エラー", error);
      alert("バッジの付与に失敗しました");
    }
  };

  const handleRemoveBadge = async (castId: number, badgeId: number) => {
    if (!confirm("このバッジを削除しますか？")) return;

    try {
      const response = await fetch(`/api/casts/${castId}/badges/${badgeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("バッジの削除に失敗しました");

      logger.info("バッジ削除成功", { castId, badgeId });
      fetchCasts();
    } catch (error) {
      logger.error("バッジ削除エラー", error);
      alert("バッジの削除に失敗しました");
    }
  };

  if (loading) return <div className="text-center">読み込み中...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">バッジ管理</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">バッジを付与</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キャスト選択
            </label>
            <select
              value={selectedCastId || ""}
              onChange={(e) => setSelectedCastId(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">選択してください</option>
              {casts.map((cast) => (
                <option key={cast.id} value={cast.id}>
                  {cast.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バッジ選択
            </label>
            <select
              value={selectedBadgeId || ""}
              onChange={(e) => setSelectedBadgeId(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">選択してください</option>
              {badges.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAssignBadge}
              className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            >
              バッジを付与
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">キャスト別バッジ一覧</h2>
        <div className="divide-y divide-gray-200">
          {casts.map((cast) => (
            <div key={cast.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{cast.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cast.badges && cast.badges.length > 0 ? (
                      cast.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: badge.color + "20",
                            color: badge.color,
                          }}
                        >
                          {badge.name}
                          <button
                            onClick={() => handleRemoveBadge(cast.id, badge.id)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">バッジなし</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}