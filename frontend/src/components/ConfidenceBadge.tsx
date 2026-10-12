import React from 'react';
import type { ConfidenceLevel } from '../types';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number;
  level?: ConfidenceLevel | null;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  level = 'moderate',
  size = 'md',
}) => {
  let colorStyles = '';
  let icon = null;
  let label = '';

  if (confidence >= 75 || level === 'high') {
    colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
    label = 'High Model Confidence';
  } else if (confidence >= 50 || level === 'moderate') {
    colorStyles = 'bg-amber-50 text-amber-800 border-amber-300';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    label = 'Moderate Confidence';
  } else {
    colorStyles = 'bg-rose-50 text-rose-800 border-rose-300';
    icon = <HelpCircle className="w-3.5 h-3.5 text-rose-600" />;
    label = 'Low Confidence';
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border font-medium ${sizeStyles} ${colorStyles}`}
      title="Detector pattern score. Does not guarantee biological correctness."
    >
      {icon}
      <span>{confidence.toFixed(1)}%</span>
      <span className="text-[10px] opacity-75 uppercase tracking-wider font-semibold">
        ({label})
      </span>
    </div>
  );
};
