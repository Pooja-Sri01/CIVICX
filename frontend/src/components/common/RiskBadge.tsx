import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskColorClass } from '../../utils/formatters';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showScore = true,
}) => {
  const colors = getRiskColorClass(level);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colors.badge} ${sizeClasses[size]} tracking-tight transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
      <span>{level}</span>
      {showScore && score !== undefined && (
        <span className="font-mono opacity-80 pl-0.5 font-bold">({score})</span>
      )}
    </span>
  );
};
