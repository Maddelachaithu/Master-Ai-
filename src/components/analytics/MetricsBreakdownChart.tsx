import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MetricOverTimePoint, PracticeFrequencyPoint } from '../../data/mockAnalytics';
import { Card } from '../common/Card';
import { Mic, Eye, MessageSquare, Calendar } from 'lucide-react';

interface MetricsBreakdownChartProps {
  metrics: MetricOverTimePoint[];
  weeklyPractice: PracticeFrequencyPoint[];
  className?: string;
}

export const MetricsBreakdownChart: React.FC<MetricsBreakdownChartProps> = ({
  metrics,
  weeklyPractice,
  className,
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className || ''}`}>
      {/* Chart 1: Filler Words Reduction & Eye Contact Consistency */}
      <Card className="p-5 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Delivery & Signal Telemetry Trends
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filler words reduction vs observed eye-contact consistency
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0f1e',
                  borderColor: 'rgba(99,102,241,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="eyeContact"
                name="Eye Contact Consistency (%)"
                stroke="#00f2fe"
                strokeWidth={2.5}
                dot={{ fill: '#00f2fe', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="fillerWords"
                name="Filler Words / Session"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#f43f5e', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: Weekly Practice Frequency */}
      <Card className="p-5 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Weekly Practice Frequency & Minutes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily practice duration and completed adversarial drills
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyPractice} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0f1e',
                  borderColor: 'rgba(99,102,241,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Bar
                dataKey="minutes"
                name="Practice Minutes"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
