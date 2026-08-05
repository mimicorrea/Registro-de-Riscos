import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { url, label } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const occurrence = await prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 });
    }

    const isAuthorized =
      session.user.role === 'ADMIN' ||
      session.user.role === 'MANAGER' ||
      occurrence.reporterId === session.user.id ||
      occurrence.assigneeId === session.user.id;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const attachment = await prisma.attachment.create({
      data: {
        occurrenceId: id,
        url,
        label: label || 'Anexo',
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('[POST /api/occurrences/[id]/attachments]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
