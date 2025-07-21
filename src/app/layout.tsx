import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <main className="pb-16">
              {children}
            </main>
            <Navigation />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
