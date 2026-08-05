import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiJson, parseBody } from '@/lib/api-utils';
import { sanitizeText } from '@/lib/sanitize';
import { createCommentSchema } from '@/lib/validations/occurrence';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError(req, 'Não autorizado', 401);
    }

    const { id } = await params;
    const parsed = await parseBody(req, createCommentSchema);
    if ('error' in parsed) return parsed.error;

    const occurrence = await prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) {
      return apiError(req, 'Ocorrência não encontrada', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        occurrenceId: id,
        authorId: session.user.id,
        content: sanitizeText(parsed.data.content),
      },
      include: { author: true },
    });

    return apiJson(req, comment, 201);
  } catch (error) {
    console.error('[POST /api/occurrences/[id]/comments]', error);
    return apiError(req, 'Erro interno', 500);
  }
}
