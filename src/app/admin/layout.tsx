import { auth } from "@/lib/auth";
import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
                  <Link href="/admin/badges" className="border-b-2 border-transparent text-secondary hover:border-primary/50 hover:text-primary inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    バッジ管理
                  </Link>
                  <Link href="/admin/admins" className="border-b-2 border-transparent text-secondary hover:border-primary/50 hover:text-primary inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    管理者管理
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-secondary text-sm mr-4">{session?.user?.name || 'ユーザー'}</span>
                <form action="/api/auth/signout" method="POST">
                  <button className="btn-secondary text-sm">
                    ログアウト
                  </button>
                </form>
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