import { NextRequest } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { RoleName } from '@/lib/enums';
import { apiError, apiJson, enforceRateLimit, parseBody } from '@/lib/api-utils';
import { sanitizeText } from '@/lib/sanitize';
import { createAnonymousOccurrenceSchema } from '@/lib/validations/occurrence';

// Endpoint público — não exige login. Qualquer pessoa pode registrar uma
// ocorrência anônima, que fica sinalizada (isAnonymous) e sem reporterId.
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, 'public-occurrence');
  if (limited) return limited;

  try {
    const parsed = await parseBody(request, createAnonymousOccurrenceSchema);
    if ('error' in parsed) return parsed.error;

    const body = parsed.data;
    const attachments = body.attachments ?? [];

    const occurrence = await prisma.occurrence.create({
      data: {
        title: sanitizeText(body.title),
        description: sanitizeText(body.description),
        category: body.category,
        severity: body.severity,
        isAnonymous: true,
        anonContact: body.contact ? sanitizeText(body.contact) : null,
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
        location: true,
      },
    });

    try {
      const managers = await prisma.user.findMany({
        where: { role: { in: [RoleName.MANAGER, RoleName.ADMIN] } },
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
              reporterName: 'Denúncia anônima',
              createdAt: occurrence.createdAt,
            },
          }),
        }).catch((err) => console.error('Erro ao enviar notificação:', err));
      }
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
    }

    return apiJson(request, { occurrence: { id: occurrence.id } }, 201);
  } catch (error) {
    console.error('Erro ao criar ocorrência anônima:', error);
    return apiError(request, 'Erro ao registrar ocorrência', 500);
  }
}
