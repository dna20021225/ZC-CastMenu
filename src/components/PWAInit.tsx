'use client';

import { useEffect } from 'react';

export default function PWAInit() {
  useEffect(() => {
    // 一時的にPWA初期化を無効化
    console.log('PWA initialization temporarily disabled for debugging');
  }, []);

  return null;
}