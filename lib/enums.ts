// Fluxo simplificado: toda ocorrência nasce "Em andamento" e o gestor marca
// "Concluída" quando resolver (podendo reabrir se necessário).
export const OCCURRENCE_STATUSES = ['IN_PROGRESS', 'RESOLVED'] as const;

export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number];

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Concluída',
};

export const STATUS_FLOW: Record<OccurrenceStatus, OccurrenceStatus[]> = {
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['IN_PROGRESS'],
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
