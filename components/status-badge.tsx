'use client';

import { STATUS_LABELS, type OccurrenceStatus } from '@/lib/enums';

const styles: Record<OccurrenceStatus, string> = {
  OPEN: 'bg-red-50 text-red-700 border-red-200',
  REVIEW: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

interface StatusBadgeProps {
  status: OccurrenceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default StatusBadge;
