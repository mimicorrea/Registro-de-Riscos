'use client';

import type { DbUser } from '@/lib/db-types';
import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AssigneeSelectProps {
  occurrenceId: string;
  currentAssignee: DbUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssigneeSelect({
  occurrenceId,
  currentAssignee,
  onClose,
  onSuccess,
}: AssigneeSelectProps) {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DbUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(currentAssignee);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users?roles=MANAGER,ADMIN');
        if (!response.ok) throw new Error('Erro ao carregar usuários');
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Selecione um responsável');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/occurrences/${occurrenceId}/assignee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeId: selectedUser.id,
          note: `Responsabilidade atribuída para ${selectedUser.name}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atribuir responsável');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir responsável');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!currentAssignee && !selectedUser) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/occurrences/${occurrenceId}/assignee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeId: null,
          note: 'Responsabilidade removida',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao remover atribuição');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover atribuição');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-100 rounded-lg shadow-xl max-w-lg w-full border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">👤 Atribuir Responsável</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              🔍 Procurar Responsável
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome ou email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="text-slate-400">⏳ Carregando usuários...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-slate-400">❌ Nenhum usuário encontrado</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 rounded-lg text-left transition text-white ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-700 border border-blue-800'
                      : 'bg-blue-600 border border-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-blue-100">{user.email}</div>
                </button>
              ))}
            </div>
          )}

          {currentAssignee && (
            <div className="px-3 py-2 bg-slate-200 rounded-lg border border-slate-300">
              <div className="text-xs text-slate-400 mb-1">Responsável Atual</div>
              <div className="text-slate-900 font-medium">{currentAssignee.name}</div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentAssignee && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 flex-1 disabled:opacity-50"
                disabled={isSubmitting || isLoading}
              >
                🗑️ Remover
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 flex-1 disabled:opacity-50"
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              disabled={isSubmitting || isLoading || !selectedUser}
            >
              {isSubmitting ? '⏳ Atribuindo...' : '✓ Atribuir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
