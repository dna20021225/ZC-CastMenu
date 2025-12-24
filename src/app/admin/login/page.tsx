"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password1234");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 既にログインしている場合は管理画面にリダイレクト
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/admin");
      // router.refresh()を削除 - 無限ループの原因
    }
  }, [session, status, router]);

  // ローディング中は何も表示しない
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="text-lg" style={{ color: 'var(--foreground)' }}>読み込み中...</div>
        </div>
      </div>
    );
  }

  // 認証済みの場合は何も表示しない（リダイレクト処理中）
  if (status === "authenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("ユーザー名またはパスワードが正しくありません");
      } else if (result?.ok) {
        router.push("/admin");
        // router.refresh()を削除 - 無限ループの原因
      } else {
        setError("ログインに失敗しました");
      }
    } catch (error) {
      console.error("ログインエラー", error);
      setError("ログイン中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full space-y-8 tablet-layout">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--primary-500)' }}>
            管理者ログイン
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  borderRadius: 'var(--border-radius)'
                }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  borderRadius: 'var(--border-radius)'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password1234"
              />
            </div>
          </div>

          {error && (
            <div className="error-message text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}