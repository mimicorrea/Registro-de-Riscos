import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: {
        reporter: true,
        assignee: true,
        location: true,
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          include: { createdBy: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 });
    }

    // Check permissions - must be manager/admin or reporter
    const isAuthorized =
      session.user.role === 'ADMIN' ||
      session.user.role === 'MANAGER' ||
      occurrence.reporterId === session.user.id;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(occurrence);
  } catch (error) {
    console.error('[GET /api/occurrences/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const occurrence = await prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 });
    }

    if (!('dueDate' in body)) {
      return NextResponse.json({ error: 'dueDate is required' }, { status: 400 });
    }

    const dueDate =
      body.dueDate === null || body.dueDate === ''
        ? null
        : new Date(body.dueDate);

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 });
    }

    const updated = await prisma.occurrence.update({
      where: { id },
      data: { dueDate },
      include: {
        reporter: true,
        assignee: true,
        location: true,
        attachments: true,
        comments: { include: { author: true } },
        statusHistory: { include: { createdBy: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/occurrences/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
