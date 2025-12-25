import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";
import { LogoutButton } from "@/components/LogoutButton";
import { UserDisplay } from "@/components/UserDisplay";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 認証チェックはMiddlewareに一元化（サーバーサイド認証チェックを削除）

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <nav className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-primary">ZC-CastMenu 管理画面</h1>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <Link href="/admin" className="border-b-2 border-primary text-primary inline-flex items-center px-1 pt-1 text-sm font-medium">
                    ダッシュボード
                  </Link>
                  <Link href="/admin/casts" className="border-b-2 border-transparent text-secondary hover:border-primary/50 hover:text-primary inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    キャスト管理
                  </Link>
                  <Link href="/admin/drinks" className="border-b-2 border-transparent text-secondary hover:border-primary/50 hover:text-primary inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    ドリンクメニュー
                  </Link>
                  <Link href="/admin/pricing" className="border-b-2 border-transparent text-secondary hover:border-primary/50 hover:text-primary inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    料金表
                  </Link>
                  <Link href="/admin#notice" className="border-b-2 border-transparent text-secondary hover:border-primary/50 hover:text-primary inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    お知らせ
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <UserDisplay />
                <LogoutButton />
              </div>
            </div>
          </div>
        </nav>
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}