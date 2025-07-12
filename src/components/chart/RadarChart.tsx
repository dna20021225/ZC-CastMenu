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
}

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  ({ 
    className, 
    stats,
    size = 'md',
    colors = {
      fill: 'rgba(59, 130, 246, 0.3)', // blue-500 with opacity
      stroke: '#3b82f6' // blue-500
    },
    ...props 
  }, ref) => {
    const baseClasses = 'flex items-center justify-center';
    
    const sizes = {
      sm: 'h-48 w-48',
      md: 'h-64 w-64', 
      lg: 'h-80 w-80'
    };

    // データの準備（1-100の範囲）
    const chartData = [
      {
        stat: STAT_LABELS.looks,
        value: stats.looks,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.talk,
        value: stats.talk,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.alcohol_tolerance,
        value: stats.alcohol_tolerance,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.intelligence,
        value: stats.intelligence,
        fullMark: 100
      },
      {
        stat: STAT_LABELS.energy,
        value: stats.energy,
        fullMark: 100
      }
    ];

    // カスタム能力値がある場合は追加
    if (stats.custom_stat && stats.custom_stat_name) {
      chartData.push({
        stat: stats.custom_stat_name,
        value: stats.custom_stat,
        fullMark: 100
      });
    }

    return (
      <div
        className={clsx(
          baseClasses,
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData}>
            <PolarGrid 
              stroke="#e5e7eb" 
              strokeWidth={1}
            />
            <PolarAngleAxis 
              dataKey="stat"
              tick={{ 
                fontSize: 12, 
                fill: '#374151',
                fontWeight: 500
              }}
              className="text-xs font-medium text-gray-700"
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ 
                fontSize: 10, 
                fill: '#9ca3af' 
              }}
              tickCount={6}
              angle={90}
            />
            <Radar
              name={stats.cast_id}
              dataKey="value"
              stroke={colors.stroke}
              fill={colors.fill}
              strokeWidth={2}
              dot={{ 
                r: 4, 
                fill: colors.stroke,
                strokeWidth: 2,
                stroke: '#ffffff'
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RadarChart.displayName = 'RadarChart';