export const OCCURRENCE_STATUSES = [
  'OPEN',
  'REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number];

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  OPEN: 'Aberta',
  REVIEW: 'Em análise',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvida',
  CLOSED: 'Encerrada',
};

export const STATUS_FLOW: Record<OccurrenceStatus, OccurrenceStatus[]> = {
  OPEN: ['REVIEW', 'IN_PROGRESS'],
  REVIEW: ['IN_PROGRESS', 'OPEN'],
  IN_PROGRESS: ['RESOLVED', 'REVIEW'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

export const CATEGORIES = [
  'ACCIDENT',
  'NEAR_MISS',
  'RISK',
  'MAINTENANCE',
  'INFRASTRUCTURE',
  'SAFETY',
  'OTHER',
] as const;

export type OccurrenceCategory = (typeof CATEGORIES)[number];

export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export type OccurrenceSeverity = (typeof SEVERITIES)[number];

export const SEVERITY_LABELS: Record<OccurrenceSeverity, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const RoleName = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];
