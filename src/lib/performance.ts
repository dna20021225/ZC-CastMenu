import { createClientLogger } from '@/lib/logger';

const logger = createClientLogger();

// パフォーマンス監視用のタイマー
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end(additionalData?: Record<string, unknown>): number {
    const duration = performance.now() - this.startTime;
    logger.debug('Performance measurement', {
      operation: this.name,
      duration: Math.round(duration * 100) / 100, // 小数点以下2桁
      ...additionalData,
    });
    return duration;
  }
}

// 非同期処理のタイマー
export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  additionalData?: Record<string, unknown>
): Promise<T> {
  const timer = new PerformanceTimer(name);
  
  return fn()
    .then((result) => {
      timer.end(additionalData);
      return result;
    })
    .catch((error) => {
      timer.end({ ...additionalData, error: true });
      throw error;
    });
}

// 画像の遅延読み込みヘルパー
export function createLazyImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
}

// メモリ使用量の監視（開発環境のみ）
export function logMemoryUsage(context: string): void {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return;
  }

  if ('memory' in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    logger.debug('Memory usage', {
      context,
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    });
  }
}

// Web Vitals の測定
export function measureWebVitals(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // CLS (Cumulative Layout Shift)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            logger.debug('Layout shift detected', {
              value: entry.value,
              sources: entry.sources?.map((source: { node?: { tagName: string }; currentRect: unknown; previousRect: unknown }) => ({
                node: source.node?.tagName,
                currentRect: source.currentRect,
                previousRect: source.previousRect,
              })),
            });
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      logger.error('Failed to observe layout shifts', error);
    }
  }

  // LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        logger.debug('LCP measured', {
          value: Math.round(lastEntry.startTime),
          element: lastEntry.element?.tagName,
        });
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      logger.error('Failed to observe LCP', error);
    }
  }

  // FID (First Input Delay)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.debug('FID measured', {
            value: Math.round(entry.processingStart - entry.startTime),
            target: entry.target?.tagName,
          });
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      logger.error('Failed to observe FID', error);
    }
  }
}

// コンポーネントの再レンダリング回数を追跡
export function useRenderCount(componentName: string): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const key = `renderCount_${componentName}`;
  const currentCount = (window as Record<string, unknown>)[key] as number || 0;
  const newCount = currentCount + 1;
  (window as Record<string, unknown>)[key] = newCount;

  if (process.env.NODE_ENV === 'development') {
    logger.debug('Component render', {
      component: componentName,
      renderCount: newCount,
    });
  }

  return newCount;
}

// バンドルサイズ分析用（開発環境のみ）
export function logBundleSize(): void {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return;
  }

  // ページ読み込み完了後にスクリプトタグを分析
  window.addEventListener('load', () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((total, script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('/_next/static/')) {
        // Next.jsのスタティックファイルサイズを推定
        return total + 100; // KB (実際のサイズは取得できないため推定値)
      }
      return total;
    }, 0);

    logger.debug('Bundle analysis', {
      scriptCount: scripts.length,
      estimatedSize: `${totalSize}KB`,
    });
  });
}