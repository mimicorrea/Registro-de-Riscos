import { NextRequest, NextResponse } from 'next/server';
import { sendOccurrenceNotification, sendStatusChangeNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, managerEmail, occurrenceData, email, statusData } = body;

  if (!type) {
    return NextResponse.json({ error: 'Tipo de notificação não especificado' }, { status: 400 });
  }

  try {
    if (type === 'occurrence') {
      const result = await sendOccurrenceNotification(managerEmail, occurrenceData);
      return NextResponse.json(result);
    } else if (type === 'status-change') {
      const result = await sendStatusChangeNotification({ email, statusData });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Tipo de notificação inválido' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de notificações:', error);
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 });
  }
}
