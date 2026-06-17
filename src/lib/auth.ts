import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

// 移行期フォールバック用の固定資格情報。
// admins テーブルに該当ユーザーが居ない（or DB アクセス失敗）場合のみ通す。
// SETUP_SECRET 経由のリセットが整った後、環境変数 DISABLE_LEGACY_LOGIN=1 で無効化する想定。
const LEGACY_USERNAME = "admin";
const LEGACY_PASSWORD = "password1234";

type AdminRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string | null;
  is_active: number;
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        // 1) DB の admins テーブルを参照（name カラムでマッチ）
        try {
          const result = await query(
            `SELECT id, name, email, password_hash, role, is_active
             FROM admins
             WHERE name = ? AND is_active = 1
             LIMIT 1`,
            [username]
          );
          const row = result.rows[0] as AdminRow | undefined;
          if (row) {
            const ok = await bcrypt.compare(password, row.password_hash);
            if (ok) {
              return {
                id: String(row.id),
                email: row.email,
                name: row.name,
                role: row.role ?? "admin"
              };
            }
            // DB にユーザーが居て pass 不一致 → フォールバックさせず拒否
            return null;
          }
        } catch (error) {
          // DB エラー時はレガシーへフォールバック（移行期の保険）
          console.error("auth: DB lookup failed, falling back to legacy", error);
        }

        // 2) フォールバック: DB に admin レコードが無い場合のみ従来のハードコード
        if (
          process.env.DISABLE_LEGACY_LOGIN !== "1" &&
          username === LEGACY_USERNAME &&
          password === LEGACY_PASSWORD
        ) {
          return {
            id: "1",
            email: "admin@zc-castmenu.com",
            name: "システム管理者",
            role: "admin"
          };
        }

        return null;
      }
    })
  ],
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
    }
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
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      console.error("NextAuth Error:", code, metadata);
    },
    warn: (code) => {
      console.warn("NextAuth Warning:", code);
    },
    debug: (code, metadata) => {
      console.log("NextAuth Debug:", code, metadata);
    }
  }
});