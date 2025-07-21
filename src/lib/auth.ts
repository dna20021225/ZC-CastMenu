import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const result = await query(
            "SELECT * FROM admins WHERE email = $1 AND is_active = true",
            [email]
          );

          const admin = result.rows[0];

          if (!admin) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role
          };
        } catch (error) {
          console.error("認証エラー:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt"
  }
});