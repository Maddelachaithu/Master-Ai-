import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { DomainProficiency } from '../../data/mockAnalytics';
import { Card } from '../common/Card';
import { ShieldCheck } from 'lucide-react';

interface SkillRadarChartProps {
  data: DomainProficiency[];
  className?: string;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data, className }) => {
  return (
    <Card className={`p-5 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Domain Competency Radar
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Your proficiency vs Industry Senior Benchmark</p>
        </div>
      </div>

      <div className="h-72 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" fontSize={9} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c0f1e',
                borderColor: 'rgba(99,102,241,0.3)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Radar
              name="Your Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.4}
            />
            <Radar
              name="Senior Benchmark"
              dataKey="benchmark"
              stroke="#00f2fe"
              fill="#00f2fe"
              fillOpacity={0.15}
              strokeDasharray="3 3"
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
