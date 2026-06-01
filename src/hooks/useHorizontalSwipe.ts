'use client';

import { useEffect, useRef } from 'react';

interface UseHorizontalSwipeOptions {
  onSwipeLeft: () => void;   // 左スワイプ → 次へ
  onSwipeRight: () => void;  // 右スワイプ → 前へ
  /**
   * スワイプとして検知する最小距離（px）。デフォルト 60。
   */
  threshold?: number;
  /**
   * 縦方向のズレが横方向より大きい場合はスワイプとして扱わない。
   * このしきい値以下の縦移動なら水平スワイプとして判定する（デフォルト 60px）。
   */
  verticalTolerance?: number;
  /**
   * スワイプの開始点がこのセレクターにマッチする要素の内側だった場合は無視する。
   * 写真カルーセルなど、内部に独自の横スワイプUIを持つ要素を除外するため。
   */
  ignoreInsideSelector?: string;
  /**
   * 無効化フラグ。true のときはイベントを発火しない。
   */
  disabled?: boolean;
}

/**
 * 画面全体に対する横スワイプを検知してコールバックを呼ぶカスタムフック。
 * touch イベントベース（タブレットを想定）。
 */
export function useHorizontalSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  verticalTolerance = 60,
  ignoreInsideSelector,
  disabled = false,
}: UseHorizontalSwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const ignoreCurrent = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;

      ignoreCurrent.current = false;
      if (ignoreInsideSelector) {
        const target = e.target as Element | null;
        if (target && target.closest(ignoreInsideSelector)) {
          ignoreCurrent.current = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      if (ignoreCurrent.current) {
        startX.current = null;
        startY.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;
      startX.current = null;
      startY.current = null;

      if (Math.abs(dy) > verticalTolerance) return;
      if (Math.abs(dx) < threshold) return;

      if (dx < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, verticalTolerance, ignoreInsideSelector, disabled]);
}
