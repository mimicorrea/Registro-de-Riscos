import { SEVERITY_LABELS, STATUS_LABELS } from '@/lib/enums';
import type { MetricsOccurrence } from '@/lib/dashboard-metrics';

export function exportOccurrencesToCsv(occurrences: MetricsOccurrence[], filename = 'ocorrencias.csv') {
  const headers = [
    'ID',
    'Título',
    'Status',
    'Gravidade',
    'Categoria',
    'Local',
    'Reportado por',
    'Data criação',
    'Prazo SLA',
  ];

  const rows = occurrences.map((o) => [
    o.id,
    escapeCsv(o.title),
    STATUS_LABELS[o.status],
    SEVERITY_LABELS[o.severity],
    o.category,
    o.location?.name ?? '',
    o.reporter?.name ?? (o.isAnonymous ? 'Anônimo' : ''),
    new Date(o.createdAt).toLocaleString('pt-BR'),
    o.dueDate ? new Date(o.dueDate).toLocaleString('pt-BR') : '',
  ]);

  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
