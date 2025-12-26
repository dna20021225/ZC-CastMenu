import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from '@/components/layout/Navigation';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZEROCLOUD NAGOYA",
  description: "ZEROCLOUD NAGOYA キャストメニュー",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZEROCLOUD",
  },
  openGraph: {
    title: "ZEROCLOUD NAGOYA",
    description: "ZEROCLOUD NAGOYA キャストメニュー",
    type: "website",
    locale: "ja_JP",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
  viewportFit: "cover",
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
