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
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">ZC-CastMenu 管理画面</h1>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <Link href="/admin" className="border-b-2 border-pink-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    ダッシュボード
                  </Link>
                  <Link href="/admin/casts" className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    キャスト管理
                  </Link>
                  <Link href="/admin/badges" className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    バッジ管理
                  </Link>
                  <Link href="/admin/admins" className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    管理者管理
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 text-sm mr-4">{session?.user?.name || 'ユーザー'}</span>
                <form action="/api/auth/signout" method="POST">
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm">
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