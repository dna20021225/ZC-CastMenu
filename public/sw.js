const CACHE_NAME = 'zc-castmenu-v1';
const urlsToCache = [
  '/',
  '/menu/pricing',
  '/menu/drinks',
  '/manifest.json',
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがある場合はそれを返す
        if (response) {
          return response;
        }

        // ネットワークリクエストを複製
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // 有効でない応答はキャッシュしない
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスを複製してキャッシュに保存
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-casts') {
    event.waitUntil(syncCasts());
  }
});

async function syncCasts() {
  try {
    const response = await fetch('/api/casts');
    const data = await response.json();
    
    // キャッシュを更新
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/api/casts', new Response(JSON.stringify(data)));
    
    console.log('キャストデータを同期しました');
  } catch (error) {
    console.error('同期エラー:', error);
  }
}