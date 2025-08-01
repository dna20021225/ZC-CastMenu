'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Service Worker{2
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker{2Ÿ:', registration);
          })
          .catch((error) => {
            console.error('Service Worker{21W:', error);
          });
      });
    }

    // ¤ó¹Èüë×íó×Èn¤ÙóÈ’­ã×Áã
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWAL¤ó¹ÈüëUŒ~W_');
    } else {
      console.log('PWAn¤ó¹ÈüëL­ãó»ëUŒ~W_');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 tablet-layout">
      <div className="bg-surface border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">¢×ê’¤ó¹Èüë</h3>
            <p className="text-xs text-secondary mt-1">
              Ûüà;bkı WfªÕé¤óg‚(gM~Y
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              Œg
            </button>
            <button
              onClick={handleInstallClick}
              className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              ¤ó¹Èüë
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// BeforeInstallPromptEventn‹š©
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}