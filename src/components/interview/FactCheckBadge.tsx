import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, Scale } from 'lucide-react';
import { FactVerdict } from '../../types';

interface FactCheckBadgeProps {
  verdict: FactVerdict;
  confidence?: number;
  size?: 'sm' | 'md';
}

export const FactCheckBadge: React.FC<FactCheckBadgeProps> = ({
  verdict,
  confidence,
  size = 'md',
}) => {
  const getBadgeConfig = () => {
    switch (verdict) {
      case 'SUPPORTED':
        return {
          icon: ShieldCheck,
          label: 'SUPPORTED',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
        };
      case 'PARTIALLY_SUPPORTED':
        return {
          icon: AlertTriangle,
          label: 'PARTIALLY SUPPORTED',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
        };
      case 'UNSUPPORTED':
        return {
          icon: XCircle,
          label: 'UNSUPPORTED',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
        };
      case 'CONTESTED':
        return {
          icon: Scale,
          label: 'CONTESTED',
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
        };
      case 'UNVERIFIED':
      default:
        return {
          icon: HelpCircle,
          label: 'UNVERIFIED',
          bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono font-medium tracking-wide backdrop-blur-sm ${
        config.bg
      } ${isSm ? 'text-[10px] py-0.5' : 'text-xs py-1'}`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="opacity-75 text-[10px]">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
};
