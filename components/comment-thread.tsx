'use client';

import type { DbComment, DbUser } from '@/lib/db-types';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface CommentThreadProps {
  occurrenceId: string;
  comments: (DbComment & { author: DbUser })[];
  currentUser: DbUser;
  onCommentAdded: () => void;
}

export default function CommentThread({
  occurrenceId,
  comments,
  currentUser,
  onCommentAdded,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || newComment.trim().length < 5) {
      setError('Comentário deve ter pelo menos 5 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/occurrences/${occurrenceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao adicionar comentário');
      }

      const createdComment = await response.json();

      // Add to local state
      setLocalComments([
        ...localComments,
        {
          ...createdComment,
          author: currentUser,
        },
      ]);

      setNewComment('');
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar comentário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      {localComments.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {localComments.map((comment) => (
            <div key={comment.id} className="p-3 bg-slate-200 rounded-lg border border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-slate-900">{comment.author.name}</div>
                <div className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { locale: pt, addSuffix: true })}
                </div>
              </div>
              <div className="text-slate-600 text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <div className="text-slate-500 italic">Nenhum comentário ainda</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário... (mín. 5 caracteres)"
          className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none resize-none h-20"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {newComment.length} / 5000 caracteres
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            disabled={isLoading || newComment.trim().length < 5}
          >
            {isLoading ? (
              <>
                ⏳ Enviando...
              </>
            ) : (
              <>
                <Send size={16} />
                Enviar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
