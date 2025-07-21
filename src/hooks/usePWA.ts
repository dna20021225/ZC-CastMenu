"use client";

import { useState, useEffect } from 'react';
import { createClientLogger } from '@/lib/logger';

const logger = createClientLogger();

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // PWAインストール可能性の検出
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setInstallPrompt(event);
      setIsInstallable(true);
      logger.info('PWA install prompt available');
    };

    // PWAインストール完了の検出
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      logger.info('PWA installed successfully');
    };

    // オンライン状態の監視
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('App is online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.info('App is offline');
    };

    // 初期状態の設定
    setIsOnline(navigator.onLine);
    
    // インストール済みかどうかの判定
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // イベントリスナーの登録
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!installPrompt) {
      logger.warn('Install prompt not available');
      return false;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        logger.info('PWA install accepted');
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      } else {
        logger.info('PWA install dismissed');
        return false;
      }
    } catch (error) {
      logger.error('PWA install failed', error);
      return false;
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        logger.info('Service Worker registered', { scope: registration.scope });
        
        // Service Workerの更新チェック
        registration.addEventListener('updatefound', () => {
          logger.info('Service Worker update found');
        });

        return registration;
      } catch (error) {
        logger.error('Service Worker registration failed', error);
        throw error;
      }
    } else {
      throw new Error('Service Worker not supported');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      logger.info('Notification permission', { permission });
      return permission === 'granted';
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          ...options,
        });
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    registerServiceWorker,
    requestNotificationPermission,
    showNotification,
  };
}