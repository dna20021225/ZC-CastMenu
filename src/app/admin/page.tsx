import { query } from "@/lib/db";
import Link from "next/link";

async function getStats() {
  try {
    const castCount = await query("SELECT COUNT(*) FROM casts");
    const badgeCount = await query("SELECT COUNT(DISTINCT badge_id) FROM cast_badges");
    const adminCount = await query("SELECT COUNT(*) FROM admins WHERE is_active = true");
    
    return {
      casts: castCount.rows[0].count,
      badges: badgeCount.rows[0].count,
      admins: adminCount.rows[0].count,
    };
  } catch (error) {
    console.error("統計情報の取得エラー:", error);
    return {
      casts: 0,
      badges: 0,
      admins: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    登録キャスト数
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.casts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/casts" className="text-sm text-pink-600 hover:text-pink-900">
              キャスト管理へ →
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    使用中バッジ数
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.badges}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/badges" className="text-sm text-pink-600 hover:text-pink-900">
              バッジ管理へ →
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    管理者数
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.admins}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/admins" className="text-sm text-pink-600 hover:text-pink-900">
              管理者管理へ →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/casts/new"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg text-center hover:bg-pink-700 transition"
          >
            新規キャスト登録
          </Link>
          <Link
            href="/admin/badges"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition"
          >
            バッジ付与管理
          </Link>
          <Link
            href="/"
            target="_blank"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg text-center hover:bg-gray-700 transition"
          >
            サイトを確認
          </Link>
        </div>
      </div>
    </div>
  );
}