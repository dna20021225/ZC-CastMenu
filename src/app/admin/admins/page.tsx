"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { UserPlus, Edit, Trash2 } from "lucide-react";



interface Admin {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      if (!response.ok) throw new Error("管理者一覧の取得に失敗しました");
      const data = await response.json();
      setAdmins(data.data);
    } catch (error) {
      console.error("管理者一覧取得エラー", error);
      alert("管理者一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`管理者「${username}」を削除してもよろしいですか？`)) return;

    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("削除に失敗しました");

      console.info("管理者削除成功", { id, username });
      fetchAdmins();
    } catch (error) {
      console.error("管理者削除エラー", error);
      alert("削除に失敗しました");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error("ステータス更新に失敗しました");

      console.info("管理者ステータス更新成功", { id, is_active: !currentStatus });
      fetchAdmins();
    } catch (error) {
      console.error("管理者ステータス更新エラー", error);
      alert("ステータス更新に失敗しました");
    }
  };

  if (loading) return <div className="text-center p-4"><div className="loading-spinner mx-auto"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>管理者管理</h1>
        <button
          onClick={() => router.push("/admin/admins/new")}
          className="btn-primary"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          新規管理者追加
        </button>
      </div>

      <div className="cast-card overflow-hidden">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
          <thead style={{ backgroundColor: 'var(--surface-variant)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                ユーザー名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                最終ログイン
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                登録日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--surface)' }} className="divide-y">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{admin.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm" style={{ color: 'var(--secondary)' }}>{admin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(admin.id, admin.is_active)}
                    className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                      admin.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.is_active ? "有効" : "無効"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary)' }}>
                  {admin.last_login
                    ? new Date(admin.last_login).toLocaleString("ja-JP")
                    : "未ログイン"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary)' }}>
                  {new Date(admin.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => router.push(`/admin/admins/${admin.id}/edit`)}
                    className="text-primary hover:text-primary/80 mr-4"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id, admin.username)}
                    style={{ color: 'var(--error)' }} className="hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
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