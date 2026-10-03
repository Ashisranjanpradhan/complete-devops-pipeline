import React from 'react';
import { HealthStatus, DeploymentStatus, IncidentStatus } from '../types';

interface StatusBadgeProps {
  status: HealthStatus | DeploymentStatus | IncidentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color = 'bg-slate-700 text-slate-200 border-slate-600';

  switch (status) {
    case 'HEALTHY':
    case 'SUCCESS':
    case 'RESOLVED':
    case 'CLOSED':
      color = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      break;
    case 'DEGRADED':
    case 'BUILDING':
    case 'TESTING':
    case 'DEPLOYING':
    case 'ACKNOWLEDGED':
    case 'INVESTIGATING':
      color = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      break;
    case 'DOWN':
    case 'FAILED':
    case 'OPEN':
      color = 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      break;
    case 'ROLLED_BACK':
      color = 'bg-purple-950/80 text-purple-400 border-purple-800/80';
      break;
    case 'QUEUED':
      color = 'bg-blue-950/80 text-blue-400 border-blue-800/80';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
};
