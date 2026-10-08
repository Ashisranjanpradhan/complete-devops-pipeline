import React from 'react';
import { IncidentSeverity } from '../types';

interface SeverityBadgeProps {
  severity: IncidentSeverity | string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  let color = 'bg-slate-700 text-slate-200';

  switch (severity) {
    case 'LOW':
      color = 'bg-blue-900/60 text-blue-300 border border-blue-700/60';
      break;
    case 'MEDIUM':
      color = 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/60';
      break;
    case 'HIGH':
      color = 'bg-orange-900/60 text-orange-300 border border-orange-700/60';
      break;
    case 'CRITICAL':
      color = 'bg-red-900/70 text-red-300 border border-red-700/80 animate-pulse';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${color}`}>
      {severity}
    </span>
  );
};
