import type { NextAuthConfig } from "next-auth";

/**
 * Edge runtime 互換の NextAuth 基本設定。
 *
 * middleware.ts はここからのみ import すること。
 * Credentials Provider の authorize（DB アクセスあり）は auth.ts 側に置く。
 *
 * 背景: middleware は必ず Edge runtime で動く。
 * auth.ts で fs/Node API（Better-SQLite3, node-postgres 経由）を使うため、
 * middleware 経由で auth.ts を import すると Edge runtime 起動時に
 * 「fs module is not supported」で落ちる。
 * NextAuth v5 公式パターンに従って設定を 2 分割している。
 */
export const authConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  trustHost: true,
} satisfies NextAuthConfig;
