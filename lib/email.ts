import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendOccurrenceNotification(
  managerEmail: string,
  occurrenceData: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    location: string;
    reporterName: string;
    createdAt: Date;
  }
) {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY não configurada — email não enviado');
      return { success: false, error: 'Email não configurado' };
    }

    await resend.emails.send({
      from: 'notificacoes@gestorderiscos.com',
      to: managerEmail,
      subject: `[${occurrenceData.severity}] Nova Ocorrência: ${occurrenceData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 20px; border-radius: 12px;">
            <h2 style="margin: 0;">🚨 Nova Ocorrência Registrada</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Título:</strong> ${occurrenceData.title}</p>
            <p><strong>Categoria:</strong> ${occurrenceData.category}</p>
            <p><strong>Gravidade:</strong> ${occurrenceData.severity}</p>
            <p><strong>Local:</strong> ${occurrenceData.location}</p>
            <p><strong>Registrado por:</strong> ${occurrenceData.reporterName}</p>
            <p><strong>Data/Hora:</strong> ${new Date(occurrenceData.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          
          <div style="background: #f0f1ff; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; border-radius: 4px;">
            <strong>Descrição:</strong>
            <p>${occurrenceData.description}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gestorderiscos.com/occurrences/${occurrenceData.id}" 
               style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver Detalhes
            </a>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">
            <p>Este é um email automático. Não responda este mensagem.</p>
            <p>Sistema Gestor de Riscos © 2026</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error };
  }
}

export async function sendStatusChangeNotification(data: {
  email: string;
  statusData: {
    title: string;
    previousStatus: string;
    newStatus: string;
    note?: string;
  };
}) {
  const { email, statusData } = data;

  try {
    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY não configurada — email não enviado');
      return { success: false, error: 'Email não configurado' };
    }

    await resend.emails.send({
      from: 'notificacoes@gestorderiscos.com',
      to: email,
      subject: `📊 Atualização de Status: ${statusData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 20px; border-radius: 12px;">
            <h2 style="margin: 0;">📊 Status Atualizado</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Ocorrência:</strong> ${statusData.title}</p>
            <p style="margin-bottom: 10px;"><strong>Mudança de Status:</strong></p>
            <p style="margin: 5px 0;"><span style="background: #e0e0e0; padding: 4px 8px; border-radius: 4px;">${statusData.previousStatus}</span> → <span style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 4px;">${statusData.newStatus}</span></p>
            ${statusData.note ? `<p style="margin-top: 10px; border-top: 1px solid #e0e0e0; padding-top: 10px;"><strong>Nota:</strong><br/>${statusData.note}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gestorderiscos.com/occurrences" 
               style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver Detalhes
            </a>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">
            <p>Este é um email automático. Não responda esta mensagem.</p>
            <p>Sistema Gestor de Riscos © 2026</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de atualização de status:', error);
    throw error;
  }
}

export async function sendAssignmentNotification(data: {
  email: string;
  assignmentData: {
    title: string;
    assigneeName: string;
    assignerName: string;
  };
}) {
  const { email, assignmentData } = data;

  try {
    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY não configurada — email não enviado');
      return { success: false, error: 'Email não configurado' };
    }

    await resend.emails.send({
      from: 'notificacoes@gestorderiscos.com',
      to: email,
      subject: `👤 Nova Atribuição: ${assignmentData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 20px; border-radius: 12px;">
            <h2 style="margin: 0;">👤 Você foi Designado</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Ocorrência:</strong> ${assignmentData.title}</p>
            <p><strong>Atribuído por:</strong> ${assignmentData.assignerName}</p>
            <p><strong>Responsável:</strong> ${assignmentData.assigneeName}</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">Você foi designado como responsável por esta ocorrência.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gestorderiscos.com/my-tasks" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Minhas Tarefas
            </a>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">
            <p>Este é um email automático. Não responda esta mensagem.</p>
            <p>Sistema Gestor de Riscos © 2026</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de atribuição:', error);
    throw error;
  }
}
