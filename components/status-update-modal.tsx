'use client';

import { STATUS_FLOW, STATUS_LABELS, type OccurrenceStatus } from '@/lib/enums';
import { X } from 'lucide-react';
import { useState } from 'react';

interface StatusUpdateModalProps {
  occurrenceId: string;
  currentStatus: OccurrenceStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StatusUpdateModal({
  occurrenceId,
  currentStatus,
  onClose,
  onSuccess,
}: StatusUpdateModalProps) {
  const [newStatus, setNewStatus] = useState<OccurrenceStatus | ''>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const availableStatuses = STATUS_FLOW[currentStatus] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus) {
      setError('Selecione um novo status');
      return;
    }

    if (!note.trim() || note.trim().length < 5) {
      setError('Nota deve ter pelo menos 5 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/occurrences/${occurrenceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: note.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar status');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-100 rounded-lg shadow-xl max-w-lg w-full border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">📊 Atualizar Status</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Status Atual
            </label>
            <div className="px-4 py-2 bg-slate-200 rounded-lg text-slate-900 font-medium">
              {STATUS_LABELS[currentStatus]}
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Novo Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OccurrenceStatus)}
              className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="">Selecione um status</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Nota de Atualização * (mín. 5 caracteres)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Descreva o motivo dessa atualização..."
              className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none resize-none h-24"
              disabled={isLoading}
            />
            <div className="text-xs text-slate-400 mt-1">
              {note.length} / 5000 caracteres
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 flex-1"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Atualizando...' : '✓ Atualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
