import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { Decimal } from '@prisma/client/runtime/library';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RoleName } from '@/lib/enums';
import { apiError, apiJson, parseBody } from '@/lib/api-utils';
import { sanitizeText } from '@/lib/sanitize';
import { createOccurrenceSchema } from '@/lib/validations/occurrence';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return apiError(request, 'Não autorizado', 401);
  }

  const isManager =
    session.user.role === RoleName.MANAGER || session.user.role === RoleName.ADMIN;

  const occurrences = await prisma.occurrence.findMany({
    where: isManager ? undefined : { reporterId: session.user.id },
    include: {
      reporter: true,
      assignee: true,
      location: true,
      attachments: true,
      statusHistory: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return apiJson(request, { occurrences });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError(request, 'Não autorizado', 401);
    }

    const parsed = await parseBody(request, createOccurrenceSchema);
    if ('error' in parsed) return parsed.error;

    const body = parsed.data;
    const attachments = body.attachments ?? [];

    const occurrence = await prisma.occurrence.create({
      data: {
        title: sanitizeText(body.title),
        description: sanitizeText(body.description),
        category: body.category,
        severity: body.severity,
        reporterId: session.user.id,
        locationId: body.locationId ?? null,
        latitude: body.latitude != null ? new Decimal(body.latitude) : undefined,
        longitude: body.longitude != null ? new Decimal(body.longitude) : undefined,
        attachments: attachments.length
          ? {
              create: attachments.map((attachment) => ({
                url: attachment.url,
                label: sanitizeText(attachment.label || 'Anexo'),
              })),
            }
          : undefined,
      },
      include: {
        reporter: true,
        location: true,
      },
    });

    try {
      const managers = await prisma.user.findMany({
        where: { role: { in: ['MANAGER', 'ADMIN'] } },
      });

      for (const manager of managers) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'occurrence',
            managerEmail: manager.email,
            occurrenceData: {
              id: occurrence.id,
              title: occurrence.title,
              description: occurrence.description,
              category: occurrence.category,
              severity: occurrence.severity,
              location: occurrence.location?.name || 'Não especificado',
              reporterName: occurrence.reporter?.name || 'Usuário',
              createdAt: occurrence.createdAt,
            },
          }),
        }).catch((err) => console.error('Erro ao enviar notificação:', err));
      }
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
    }

    return apiJson(request, { occurrence }, 201);
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    return apiError(request, 'Erro ao criar ocorrência', 500);
  }
}
