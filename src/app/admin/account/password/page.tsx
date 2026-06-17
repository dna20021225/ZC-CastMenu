"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("新しいパスワードは 8 文字以上にしてください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードと確認用パスワードが一致しません");
      return;
    }
    if (currentPassword === newPassword) {
      setError("現在のパスワードと同じです");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admins/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "パスワード変更に失敗しました");
      }
      setSuccess(data.message || "パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "パスワード変更に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-4 text-sm"
        style={{ color: "var(--secondary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        戻る
      </button>

      <div className="flex items-center gap-3 mb-6">
        <KeyRound className="w-8 h-8" style={{ color: "var(--primary-500)" }} />
        <h1 className="text-3xl font-bold" style={{ color: "var(--primary-500)" }}>
          パスワード変更
        </h1>
      </div>

      {session?.user?.name && (
        <p className="text-sm mb-4" style={{ color: "var(--secondary)" }}>
          ログイン中: <span className="font-medium">{session.user.name}</span>
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-6 space-y-4"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-1">現在のパスワード</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-variant)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">新しいパスワード（8文字以上）</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-variant)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">新しいパスワード（確認）</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-variant)" }}
          />
        </div>

        {error && (
          <div className="text-sm p-3 rounded" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--error)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm p-3 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "rgb(22, 163, 74)" }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? "変更中..." : "パスワードを変更"}
        </button>
      </form>
    </div>
  );
}
