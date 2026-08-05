import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { STATUS_FLOW, type OccurrenceStatus } from '@/lib/enums';
import { sendStatusChangeNotification } from '@/lib/email';
import { parseBody } from '@/lib/api-utils';
import { sanitizeText } from '@/lib/sanitize';
import { updateStatusSchema } from '@/lib/validations/occurrence';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Only managers and admins can update status
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden - Only managers can update status' }, { status: 403 });
    }

    const { id } = await params;
    const parsed = await parseBody(req, updateStatusSchema);
    if ('error' in parsed) return parsed.error;

    const { status, note } = parsed.data;

    // Get current occurrence
    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: { reporter: true, statusHistory: true },
    });

    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 });
    }

    // Validate status transition
    const validStatuses = STATUS_FLOW[occurrence.status as OccurrenceStatus];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${occurrence.status} to ${status}. Valid statuses: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Update occurrence and create status history
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create status history
      await tx.statusHistory.create({
        data: {
          occurrenceId: id,
          previous: occurrence.status,
          current: status,
          note: sanitizeText(note),
          createdById: userId,
        },
      });

      // Update occurrence
      const updatedOccurrence = await tx.occurrence.update({
        where: { id },
        data: { status },
        include: {
          reporter: true,
          assignee: true,
          location: true,
          attachments: true,
          comments: { include: { author: true } },
          statusHistory: { include: { createdBy: true } },
        },
      });

      return updatedOccurrence;
    });

    // Send email notification (só há e-mail quando a ocorrência tem um reporter identificado)
    if (occurrence.reporter) {
      try {
        await sendStatusChangeNotification({
          email: occurrence.reporter.email,
          statusData: {
            title: occurrence.title,
            previousStatus: occurrence.status,
            newStatus: status,
            note: sanitizeText(note),
          },
        });
      } catch (emailError) {
        console.warn('Failed to send status change email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/occurrences/[id]/status]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
