'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number; // ミリ秒
}

export function SplashScreen({ children, duration = 1500 }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // セッション中に既に表示済みかチェック
    const hasShown = sessionStorage.getItem('splashShown');
    if (hasShown) {
      setShowSplash(false);
      return;
    }

    // フェードアウト開始
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 300);

    // スプラッシュ非表示
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('splashShown', 'true');
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center">
          <Image
            src="/icon-512.png"
            alt="ZEROCLOUD"
            width={150}
            height={150}
            priority
          />
        </div>
      </div>
      <div className="opacity-0">{children}</div>
    </>
  );
}
