import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeType?: 'default' | 'critical' | 'high' | 'lime' | 'emerald';
  icon?: LucideIcon;
  trend?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  badgeType = 'default',
  icon: Icon,
  trend,
  onClick,
}) => {
  const badgeStyles = {
    default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    lime: 'bg-lime-light text-civic-dark border-lime',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-card hover:-translate-y-0.5' : 'shadow-subtle'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
            {title}
          </p>
          <h3 className="font-display font-bold text-2xl lg:text-3xl text-civic-dark tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-zinc-100/80 border border-zinc-200 flex items-center justify-center text-zinc-700">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
        {subtitle && (
          <span className="text-xs text-zinc-500 truncate">
            {subtitle}
          </span>
        )}
        {badge && (
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
        {trend && (
          <span className="text-[11px] font-medium text-zinc-600 font-mono">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
