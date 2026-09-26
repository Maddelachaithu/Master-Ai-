import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ScoreTrendDataPoint } from '../../data/mockAnalytics';
import { Card } from '../common/Card';
import { TrendingUp } from 'lucide-react';

interface PerformanceTrendChartProps {
  data: ScoreTrendDataPoint[];
  className?: string;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  data,
  className,
}) => {
  return (
    <Card className={`p-5 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl ${className || ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Performance Progression Over Time
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Technical knowledge, reasoning depth, and communication trajectory
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Overall
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Reasoning
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Communication
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="reasoningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              domain={[50, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c0f1e',
                borderColor: 'rgba(99,102,241,0.3)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            />
            <Area
              type="monotone"
              dataKey="overall"
              name="Overall Score"
              stroke="#00f2fe"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#overallGrad)"
            />
            <Area
              type="monotone"
              dataKey="reasoning"
              name="Reasoning Score"
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#reasoningGrad)"
            />
            <Area
              type="monotone"
              dataKey="communication"
              name="Communication Score"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
