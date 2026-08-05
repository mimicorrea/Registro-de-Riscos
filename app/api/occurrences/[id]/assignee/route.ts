import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAssignmentNotification } from '@/lib/email';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers and admins can assign
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden - Only managers can assign' }, { status: 403 });
    }

    const { id } = await params;
    const { assigneeId, note } = await req.json();

    // Validate assignee if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (assignee.role === 'EMPLOYEE') {
        return NextResponse.json(
          { error: 'Can only assign to managers or admins' },
          { status: 400 }
        );
      }
    }

    // Get current occurrence
    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: { assignee: true },
    });

    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 });
    }

    // Update occurrence with new assignee
    const updated = await prisma.occurrence.update({
      where: { id },
      data: { assigneeId: assigneeId || null },
      include: {
        reporter: true,
        assignee: true,
        location: true,
        attachments: true,
        comments: { include: { author: true } },
        statusHistory: { include: { createdBy: true } },
      },
    });

    // Send email notification to new assignee
    if (assigneeId) {
      try {
        const newAssignee = updated.assignee;
        if (newAssignee) {
          await sendAssignmentNotification({
            email: newAssignee.email,
            assignmentData: {
              title: occurrence.title,
              assigneeName: newAssignee.name || 'Usuário',
              assignerName: session.user.name || 'Gerenciador',
            },
          });
        }
      } catch (emailError) {
        console.warn('Failed to send assignment email:', emailError);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/occurrences/[id]/assignee]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
