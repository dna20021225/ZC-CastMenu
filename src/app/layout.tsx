import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZC-CastMenu - キャストメニュー",
  description: "キャスト一覧とプロフィール表示システム",
  manifest: "/manifest.json",
  themeColor: "#ec4899",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CastMenu",
  },
  openGraph: {
    title: "ZC-CastMenu",
    description: "キャスト一覧とプロフィール表示システム",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} antialiased bg-gray-50 min-h-screen`}
      >
        <main className="pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
