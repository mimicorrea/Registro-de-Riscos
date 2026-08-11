'use client';

import {
  type OccurrenceCategory,
  type OccurrenceSeverity,
  type OccurrenceStatus,
} from '@/lib/enums';
import { Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface FilterState {
  statuses: OccurrenceStatus[];
  severities: OccurrenceSeverity[];
  categories: OccurrenceCategory[];
  locationIds: string[];
  search: string;
  dateFrom?: string;
  dateTo?: string;
  assigneeId?: string;
}

interface LocationOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS: Array<{ value: OccurrenceStatus; label: string }> = [
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'RESOLVED', label: 'Concluída' },
];

const SEVERITY_OPTIONS: Array<{ value: OccurrenceSeverity; label: string }> = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

const CATEGORY_OPTIONS: Array<{ value: OccurrenceCategory; label: string }> = [
  { value: 'ACCIDENT', label: 'Acidente' },
  { value: 'NEAR_MISS', label: 'Quase Acidente' },
  { value: 'RISK', label: 'Risco' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'INFRASTRUCTURE', label: 'Infraestrutura' },
  { value: 'SAFETY', label: 'Segurança' },
  { value: 'OTHER', label: 'Outro' },
];

export default function AdvancedFilters({
  onFilterChange,
  isOpen,
  onToggle,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    severities: [],
    categories: [],
    locationIds: [],
    search: '',
  });
  const [locations, setLocations] = useState<LocationOption[]>([]);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => setLocations(data.locations ?? []))
      .catch(() => setLocations([]));
  }, []);

  const handleStatusToggle = (status: OccurrenceStatus) => {
    const updated = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    updateFilters({ ...filters, statuses: updated });
  };

  const handleSeverityToggle = (severity: OccurrenceSeverity) => {
    const updated = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];
    updateFilters({ ...filters, severities: updated });
  };

  const handleCategoryToggle = (category: OccurrenceCategory) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilters({ ...filters, categories: updated });
  };

  const handleLocationToggle = (locationId: string) => {
    const updated = filters.locationIds.includes(locationId)
      ? filters.locationIds.filter((id) => id !== locationId)
      : [...filters.locationIds, locationId];
    updateFilters({ ...filters, locationIds: updated });
  };

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters: FilterState = {
      statuses: [],
      severities: [],
      categories: [],
      locationIds: [],
      search: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount =
    filters.statuses.length +
    filters.severities.length +
    filters.categories.length +
    filters.locationIds.length +
    (filters.search ? 1 : 0);

  return (
    <div className="bg-slate-100 rounded-lg shadow-lg border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-400" />
          <span className="font-medium text-slate-900">Filtros Avançados</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <span className="text-slate-400">{isOpen ? '▼' : '▶'}</span>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              🔍 Procurar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              placeholder="Título ou descrição..."
              className="w-full px-3 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(option.value)}
                    onChange={() => handleStatusToggle(option.value)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-600">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Severidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.severities.includes(option.value)}
                    onChange={() => handleSeverityToggle(option.value)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-600">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {CATEGORY_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(option.value)}
                    onChange={() => handleCategoryToggle(option.value)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-600">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          {locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Local da ocorrência
              </label>
              <div className="grid grid-cols-2 gap-2">
                {locations.map((location) => (
                  <label key={location.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.locationIds.includes(location.id)}
                      onChange={() => handleLocationToggle(location.id)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-600">{location.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Data De
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Data Até
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 flex-1 text-sm gap-1"
            >
              <X size={16} />
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
