// キャッシュ名はバージョン込み。SW更新時に古いキャッシュは activate で消す。
const CACHE_NAME = 'zc-castmenu-v2';
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
// HTMLナビゲーション（ページ遷移）はネットワーク優先＝管理画面で変更したテーマや
// お知らせを即座に反映させたい。オフライン時のみキャッシュにフォールバック。
// それ以外（画像/JS/CSS）はキャッシュ優先で従来通り高速表示。
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // GET 以外と /api/* / /_next/data/* はSWでハンドリングしない（毎回ネットワーク）
  if (req.method !== 'GET' || new URL(req.url).pathname.startsWith('/api/')) {
    return;
  }

  // HTMLナビゲーションはネットワーク優先
  const isHtml = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // 取れたHTMLは新しい方をキャッシュに上書き保存
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  // それ以外（画像/JS/CSS等）はキャッシュ優先
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});

// 管理画面からの「キャッシュ全消し」要求を受け付ける。
// テーマ保存後、クライアントが postMessage で送ってきたらキャッシュを全削除する。
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    );
  }
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