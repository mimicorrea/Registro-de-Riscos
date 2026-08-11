'use client';

import type { DbUser, OccurrenceWithRelations } from '@/lib/db-types';
import { MapPin, Calendar, User as UserIcon, Clock, Printer, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import StatusBadge from './status-badge';
import StatusUpdateModal from './status-update-modal';
import AssigneeSelect from './assignee-select';
import DueDateModal from './due-date-modal';
import FollowUpUpload from './follow-up-upload';
import CommentThread from './comment-thread';
import { LazyImage } from './lazy-image';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { SEVERITY_LABELS, STATUS_LABELS } from '@/lib/enums';

interface OccurrenceDetailProps {
  occurrence: OccurrenceWithRelations;
  currentUser: DbUser;
  canEdit: boolean;
}

export default function OccurrenceDetail({
  occurrence,
  currentUser,
  canEdit,
}: OccurrenceDetailProps) {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssigneeSelect, setShowAssigneeSelect] = useState(false);
  const [showDueDateModal, setShowDueDateModal] = useState(false);

  const refresh = () => router.refresh();

  const isOverdue =
    occurrence.dueDate &&
    occurrence.status !== 'RESOLVED' &&
    new Date(occurrence.dueDate) < new Date();

  // A foto original (enviada por quem registrou a ocorrência) já aparece nos
  // cards de lista/dashboard — aqui mostramos só as fotos de correção,
  // enviadas pelo gestor ao tratar/resolver o problema.
  const correctionPhotos = occurrence.attachments.filter((a) => a.label?.startsWith('Correção'));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            href="/occurrences"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            ← Voltar
          </Link>
          <Link
            href={`/occurrences/${occurrence.id}/report`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            Relatório / PDF
          </Link>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-slate-900">{occurrence.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={occurrence.status} />
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  {occurrence.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    occurrence.severity === 'CRITICAL'
                      ? 'bg-red-50 text-red-700'
                      : occurrence.severity === 'HIGH'
                        ? 'bg-orange-50 text-orange-700'
                        : occurrence.severity === 'MEDIUM'
                          ? 'bg-yellow-50 text-yellow-800'
                          : 'bg-green-50 text-green-700'
                  }`}
                >
                  {SEVERITY_LABELS[occurrence.severity]}
                </span>
              </div>
            </div>
          </div>

          <p className="mb-6 text-slate-600">{occurrence.description}</p>

          {canEdit && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                📊 Atualizar Status
              </button>
              <button
                onClick={() => setShowAssigneeSelect(true)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                👤 Atribuir Responsável
              </button>
              <button
                onClick={() => setShowDueDateModal(true)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                ⏰ Definir SLA
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">📋 Informações</h3>

              <div className="mb-4 border-b border-slate-200 pb-4">
                <div className="mb-1 text-sm text-slate-500">Reportado por</div>
                {occurrence.reporter ? (
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{occurrence.reporter.name}</div>
                      <div className="text-sm text-slate-500">{occurrence.reporter.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-purple-400" />
                    <div>
                      <div className="font-medium text-purple-700">Anônimo</div>
                      {occurrence.anonContact && (
                        <div className="text-sm text-slate-500">Contato: {occurrence.anonContact}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4 border-b border-slate-200 pb-4">
                <div className="mb-1 text-sm text-slate-500">Responsável</div>
                {occurrence.assignee ? (
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-emerald-500" />
                    <div>
                      <div className="font-medium text-slate-900">{occurrence.assignee.name}</div>
                      <div className="text-sm text-slate-500">{occurrence.assignee.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm italic text-slate-500">Não atribuído</div>
                )}
              </div>

              {occurrence.location && (
                <div className="mb-4 border-b border-slate-200 pb-4">
                  <div className="mb-1 text-sm text-slate-500">Local</div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-slate-900">{occurrence.location.name}</span>
                  </div>
                </div>
              )}

              <div className="mb-4 border-b border-slate-200 pb-4">
                <div className="mb-1 text-sm text-slate-500">Prazo (SLA)</div>
                {occurrence.dueDate ? (
                  <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                    {new Date(occurrence.dueDate).toLocaleString('pt-BR')}
                    {isOverdue && ' — Vencido'}
                  </div>
                ) : (
                  <div className="text-sm italic text-slate-500">Não definido</div>
                )}
              </div>

              {occurrence.latitude != null && occurrence.longitude != null && (
                <div className="mb-4 border-b border-slate-200 pb-4">
                  <div className="mb-1 text-sm text-slate-500">Coordenadas GPS</div>
                  <div className="font-mono text-sm text-slate-900">
                    <div>{Number(occurrence.latitude).toFixed(6)}</div>
                    <div>{Number(occurrence.longitude).toFixed(6)}</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-sm text-slate-500">Data de Criação</div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-900">
                      {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-500">Última Atualização</div>
                  <div className="text-sm text-slate-900">
                    {formatDistanceToNow(new Date(occurrence.updatedAt), { locale: pt, addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">📊 Histórico de Status</h3>
              <div className="space-y-3">
                {occurrence.statusHistory.length > 0 ? (
                  [...occurrence.statusHistory]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((history) => (
                      <div key={history.id} className="border-b border-slate-200 pb-3 last:border-0">
                        <div className="mb-1 flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(history.createdAt), { locale: pt, addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">{STATUS_LABELS[history.previous]}</span>
                          <span className="mx-2 text-slate-400">→</span>
                          <span className="font-medium text-slate-900">{STATUS_LABELS[history.current]}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Por {history.createdBy.name}</div>
                        {history.note && (
                          <div className="ml-4 mt-1 border-l-2 border-slate-300 pl-3 text-sm text-slate-600">
                            {history.note}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-sm italic text-slate-500">Sem histórico</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {correctionPhotos.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">📷 Fotos da correção</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {correctionPhotos.map((attachment) => (
                    <div key={attachment.id} className="group relative">
                      <LazyImage
                        src={attachment.url}
                        alt={attachment.label || 'Foto'}
                        className="h-40 w-full rounded-lg"
                      />
                      {attachment.label && (
                        <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/70 p-2">
                          <p className="text-xs text-white">{attachment.label}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(canEdit || occurrence.assigneeId === currentUser.id) && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">🔧 Fotos de correção</h3>
                <FollowUpUpload occurrenceId={occurrence.id} />
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">💬 Comentários</h3>
              <CommentThread
                occurrenceId={occurrence.id}
                comments={occurrence.comments}
                currentUser={currentUser}
                onCommentAdded={refresh}
              />
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <StatusUpdateModal
          occurrenceId={occurrence.id}
          currentStatus={occurrence.status}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            setShowStatusModal(false);
            refresh();
          }}
        />
      )}

      {showAssigneeSelect && (
        <AssigneeSelect
          occurrenceId={occurrence.id}
          currentAssignee={occurrence.assignee}
          onClose={() => setShowAssigneeSelect(false)}
          onSuccess={() => {
            setShowAssigneeSelect(false);
            refresh();
          }}
        />
      )}

      {showDueDateModal && (
        <DueDateModal
          occurrenceId={occurrence.id}
          currentDueDate={occurrence.dueDate ? String(occurrence.dueDate) : null}
          onClose={() => setShowDueDateModal(false)}
          onSuccess={() => {
            setShowDueDateModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
