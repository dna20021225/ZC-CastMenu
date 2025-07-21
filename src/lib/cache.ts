import { createClientLogger } from '@/lib/logger';

const logger = createClientLogger();

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    logger.debug('Cache set', { key, ttl: ttlMs });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // TTL チェック
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      logger.debug('Cache expired', { key });
      return null;
    }

    logger.debug('Cache hit', { key });
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    logger.debug('Cache deleted', { key });
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Cache cleared');
  }

  // 期限切れアイテムのクリーンアップ
  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    // まだ制限を超えている場合、古いアイテムを削除
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const deleteCount = this.cache.size - Math.floor(this.maxSize * 0.8);
      for (let i = 0; i < deleteCount; i++) {
        this.cache.delete(entries[i][0]);
        deletedCount++;
      }
    }

    logger.debug('Cache cleanup completed', { deletedCount });
  }

  // 統計情報
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// シングルトンインスタンス
export const memoryCache = new MemoryCache();

// キャッシュキーのヘルパー
export const CacheKeys = {
  castList: (params: string) => `cast-list:${params}`,
  castDetail: (id: string) => `cast-detail:${id}`,
  adminList: () => 'admin-list',
  badgeList: () => 'badge-list',
} as const;

// ブラウザのキャッシュAPIを使用するヘルパー（Service Worker環境）
export class BrowserCache {
  private cacheName: string;

  constructor(cacheName = 'zc-castmenu-v1') {
    this.cacheName = cacheName;
  }

  async get(url: string): Promise<Response | undefined> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return undefined;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      
      if (response) {
        logger.debug('Browser cache hit', { url });
        return response;
      }
    } catch (error) {
      logger.error('Browser cache get error', error);
    }

    return undefined;
  }

  async set(url: string, response: Response): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(url, response.clone());
      logger.debug('Browser cache set', { url });
    } catch (error) {
      logger.error('Browser cache set error', error);
    }
  }

  async delete(url: string): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      await cache.delete(url);
      logger.debug('Browser cache deleted', { url });
    } catch (error) {
      logger.error('Browser cache delete error', error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      await caches.delete(this.cacheName);
      logger.debug('Browser cache cleared');
    } catch (error) {
      logger.error('Browser cache clear error', error);
    }
  }
}

export const browserCache = new BrowserCache();