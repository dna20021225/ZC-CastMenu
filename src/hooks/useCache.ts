"use client";

import { useState, useEffect, useCallback } from 'react';
import { memoryCache, CacheKeys } from '@/lib/cache';
import { createClientLogger } from '@/lib/logger';

const logger = createClientLogger();

interface UseCacheOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (useCache = true) => {
    try {
      // キャッシュから取得を試行
      if (useCache) {
        const cached = memoryCache.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      setLoading(true);
      const result = await fetcher();
      
      // キャッシュに保存
      memoryCache.set(key, result, ttl);
      
      setData(result);
      setError(null);
      setLoading(false);
      
      logger.debug('Data fetched and cached', { key });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      logger.error('Fetch error', error, { key });
      throw error;
    }
  }, [key, fetcher, ttl]);

  const revalidate = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    memoryCache.delete(key);
    setData(null);
    logger.debug('Cache invalidated', { key });
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // stale-while-revalidate パターン
  useEffect(() => {
    if (staleWhileRevalidate && data) {
      const timer = setTimeout(() => {
        fetchData(false).catch(() => {
          // バックグラウンド更新でエラーが発生しても無視
        });
      }, ttl * 0.8); // TTLの80%で更新

      return () => clearTimeout(timer);
    }
  }, [data, fetchData, staleWhileRevalidate, ttl]);

  return {
    data,
    loading,
    error,
    revalidate,
    invalidate,
  };
}