'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { 
  RadarChart as RechartsRadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from 'recharts';
import { clsx } from 'clsx';
import { CastStats, STAT_LABELS } from '@/types';

interface RadarChartProps extends HTMLAttributes<HTMLDivElement> {
  stats: CastStats;
  size?: 'sm' | 'md' | 'lg';
  colors?: {
    fill: string;
    stroke: string;
  };
  theme?: 'default' | 'premium';
}

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  ({ 
    className, 
    stats,
    size = 'md',
    colors,
    theme = 'default',
    ...props 
  }, ref) => {
    // コンテナの余白を最小化して、内側のグラフ描画領域を最大化
    const baseClasses = 'relative flex items-center justify-center p-1';

    const sizes = {
      sm: 'h-48 w-full',
      md: 'h-72 w-full',
      lg: 'h-96 w-full'
    };

    // 新デザインシステムに対応したカラーパレット
    const defaultColors = {
      fill: 'rgba(59, 130, 246, 0.2)', // CSS変数対応の青
      stroke: '#2563eb' // primary-600
    };

    const premiumColors = {
      fill: 'rgba(147, 51, 234, 0.2)', // 紫系
      stroke: '#9333ea'
    };

    const chartColors = colors || (theme === 'premium' ? premiumColors : defaultColors);

    // データの準備（1-100の範囲）
    const chartData = [
      {
        stat: STAT_LABELS.looks,
        value: stats.looks || 0,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.talk,
        value: stats.talk || 0,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.alcohol_tolerance,
        value: stats.alcohol_tolerance || 0,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.intelligence,
        value: stats.intelligence || 0,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.energy,
        value: stats.energy || 0,
        fullMark: 100
      }
    ];

    // カスタム能力値（スペシャル）を追加
    chartData.push({
      stat: stats.custom_stat_name || '(未設定)',
      value: stats.custom_stat || 0,
      fullMark: 100
    });

    return (
      <div
        className={clsx(
          baseClasses,
          sizes[size],
          'bg-gradient-to-br from-surface to-surface-variant rounded-xl shadow-sm',
          className
        )}
        ref={ref}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
            {/* グリッド線 */}
            <PolarGrid
              stroke="var(--border)"
              strokeWidth={1}
              strokeOpacity={0.6}
            />

            {/* ラベル軸 */}
            <PolarAngleAxis
              dataKey="stat"
              tick={({ payload, x, y, textAnchor }) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fontSize={10}
                  fontWeight={600}
                  fill={payload.value === '(未設定)' ? '#3b82f6' : 'var(--foreground)'}
                >
                  {payload.value}
                </text>
              )}
            />
            
            {/* 数値軸 */}
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ 
                fontSize: 9, 
                fill: 'var(--accent-600)',
                fontWeight: 500
              }}
              tickCount={5}
              angle={90}
              axisLine={false}
            />
            
            {/* データ表示 */}
            <Radar
              name="能力値"
              dataKey="value"
              stroke={chartColors.stroke}
              fill={chartColors.fill}
              strokeWidth={3}
              fillOpacity={0.3}
              dot={{ 
                r: 5, 
                fill: chartColors.stroke,
                strokeWidth: 2,
                stroke: '#ffffff',
                fillOpacity: 1
              }}
              activeDot={{
                r: 7,
                fill: chartColors.stroke,
                strokeWidth: 3,
                stroke: '#ffffff',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RadarChart.displayName = 'RadarChart';