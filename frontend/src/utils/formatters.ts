import { RiskLevel } from '../types';

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)} Lakhs`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getRiskColorClass(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  badge: string;
} {
  switch (level) {
    case 'Critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-600',
        badge: 'bg-red-100/80 text-red-700 border-red-200'
      };
    case 'High':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-600',
        badge: 'bg-orange-100/80 text-orange-700 border-orange-200'
      };
    case 'Medium':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-600',
        badge: 'bg-amber-100/80 text-amber-700 border-amber-200'
      };
    case 'Low':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600',
        badge: 'bg-emerald-100/80 text-emerald-700 border-emerald-200'
      };
  }
}

export function getConditionStatus(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Optimal Condition', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 60) return { label: 'Fair Condition', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (score >= 40) return { label: 'Degraded Pavement', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  return { label: 'Structural Failure', color: 'text-red-700 bg-red-50 border-red-200' };
}
