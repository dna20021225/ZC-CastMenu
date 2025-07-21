const CACHE_NAME = 'zc-castmenu-v1';
const STATIC_CACHE_NAME = 'zc-castmenu-static-v1';
const DYNAMIC_CACHE_NAME = 'zc-castmenu-dynamic-v1';

// キャッシュするリソース
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  // アイコンやその他の静的リソース
];

// API エンドポイント（オフライン時の処理）
const API_ROUTES = [
  '/api/casts',
  '/api/admins',
  '/api/badges'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('zc-castmenu-') && 
                     cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// フェッチイベント - ネットワークファースト戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 同一オリジンのリクエストのみ処理
  if (url.origin !== self.location.origin) {
    return;
  }

  // API リクエストの処理
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 静的リソースの処理
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API リクエストの処理（ネットワークファースト）
async function handleApiRequest(request) {
  try {
    // ネットワークから取得を試行
    const response = await fetch(request);
    
    if (response.ok) {
      // 成功した場合、動的キャッシュに保存
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // ネットワークが失敗した場合、キャッシュから取得
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // キャッシュにもない場合、オフライン用のレスポンスを返す
    return new Response(
      JSON.stringify({
        success: false,
        error: 'オフライン中です。インターネット接続を確認してください。',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 静的リソースの処理（キャッシュファースト）
async function handleStaticRequest(request) {
  // まずキャッシュから取得を試行
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // キャッシュにない場合、ネットワークから取得
    const response = await fetch(request);
    
    if (response.ok) {
      // 成功した場合、適切なキャッシュに保存
      const cacheName = STATIC_ASSETS.includes(request.url) ? 
        STATIC_CACHE_NAME : DYNAMIC_CACHE_NAME;
      
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    
    // HTMLページの場合、オフラインページを返す
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // その他の場合は標準のエラーレスポンス
    throw error;
  }
}

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'cast-data-sync') {
    event.waitUntil(syncCastData());
  }
});

async function syncCastData() {
  try {
    // オフライン時に蓄積されたデータの同期処理
    console.log('[SW] Syncing cast data...');
    
    // 実装例: IndexedDBからペンディング中のデータを取得して送信
    // const pendingData = await getPendingData();
    // await sendPendingData(pendingData);
    
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push event');
  
  const options = {
    body: event.data ? event.data.text() : 'ZC-CastMenuから通知があります',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('ZC-CastMenu', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/')
  );
});