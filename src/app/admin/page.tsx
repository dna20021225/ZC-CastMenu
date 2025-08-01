import { query } from "@/lib/db";
import Link from "next/link";

async function getStats() {
  try {
    const castCount = await query("SELECT COUNT(*) FROM casts");
    const badgeCount = await query("SELECT COUNT(DISTINCT badge_id) FROM cast_badges");
    const adminCount = await query("SELECT COUNT(*) FROM users WHERE is_active = true");
    
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
      <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>ダッシュボード</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">
                    登録キャスト数
                  </dt>
                  <dd className="text-3xl font-semibold text-primary">
                    {stats.casts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-surface-variant px-5 py-3 border-t border-border">
            <Link href="/admin/casts" className="text-sm text-primary hover:text-primary/80 transition-colors">
              キャスト管理へ →
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">
                    使用中バッジ数
                  </dt>
                  <dd className="text-3xl font-semibold text-primary">
                    {stats.badges}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-surface-variant px-5 py-3 border-t border-border">
            <Link href="/admin/badges" className="text-sm text-primary hover:text-primary/80 transition-colors">
              バッジ管理へ →
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">
                    管理者数
                  </dt>
                  <dd className="text-3xl font-semibold text-primary">
                    {stats.admins}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-surface-variant px-5 py-3 border-t border-border">
            <Link href="/admin/admins" className="text-sm text-primary hover:text-primary/80 transition-colors">
              管理者管理へ →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>クイックアクション</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/casts/new"
            className="btn-primary text-center"
          >
            新規キャスト登録
          </Link>
          <Link
            href="/admin/badges"
            className="btn-secondary text-center"
          >
            バッジ付与管理
          </Link>
          <Link
            href="/"
            target="_blank"
            className="btn-secondary text-center"
          >
            サイトを確認
          </Link>
        </div>
      </div>
    </div>
  );
}