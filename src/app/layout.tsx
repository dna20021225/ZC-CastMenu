import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from '@/components/layout/Navigation';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZC-CastMenu - タブレット専用男メニュー",
  description: "タブレット専用男メニューアプリケーション",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZC-CastMenu",
  },
  openGraph: {
    title: "ZC-CastMenu",
    description: "タブレット専用男メニューアプリケーション",
    type: "website",
    locale: "ja_JP",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
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
        className={`${inter.className} antialiased bg-background min-h-screen`}
      >
        <main className="pb-16">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
