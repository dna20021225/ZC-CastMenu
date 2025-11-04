"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {

  const handleLogout = async () => {
    // NextAuth標準のログアウト処理（簡素化で競合状態を回避）
    await signOut({ 
      callbackUrl: "/admin/login",
      redirect: true
    });
  };

  return (
    <button onClick={handleLogout} className="btn-secondary text-sm">
      ログアウト
    </button>
  );
}