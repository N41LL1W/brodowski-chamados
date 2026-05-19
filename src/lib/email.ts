import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = process.env.SMTP_FROM || 'TI Brodowski <noreply@brodowski.sp.gov.br>';
const BASE_URL = process.env.NEXTAUTH_URL || 'https://brodowski-chamados.vercel.app';

// ============================================================
// TEMPLATE BASE
// ============================================================
function baseTemplate(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

      <!-- HEADER -->
      <tr><td style="background:#0f172a;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
        <div style="display:inline-block;background:#2563eb;border-radius:12px;padding:10px 18px;margin-bottom:12px;">
          <span style="color:#fff;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">TI</span>
        </div>
        <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">${title}</div>
        <div style="color:#94a3b8;font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Prefeitura Municipal de Brodowski</div>
      </td></tr>

      <!-- CONTEÚDO -->
      <tr><td style="background:#ffffff;padding:32px;">
        ${content}
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;">
          Este e-mail foi enviado automaticamente pelo sistema de chamados.<br/>
          Prefeitura Municipal de Brodowski — SP
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ============================================================
// E-MAIL: VERIFICAÇÃO DE CONTA
// ============================================================
export async function sendVerificationEmail(
    to: string,
    name: string,
    token: string
): Promise<boolean> {
    const verifyUrl = `${BASE_URL}/api/verificar-email?token=${token}`;

    const content = `
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Olá, ${name}</p>
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:900;">Confirme seu e-mail</h2>
        <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
            Você criou uma conta no sistema de chamados da Prefeitura de Brodowski. 
            Clique no botão abaixo para confirmar seu e-mail e ativar o acesso.
        </p>
        <div style="text-align:center;margin:0 0 24px;">
            <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
                Confirmar e-mail
            </a>
        </div>
        <div style="background:#f8fafc;border-radius:10px;padding:14px 16px;border:1px solid #e2e8f0;">
            <p style="margin:0;color:#64748b;font-size:11px;">
                ⏱ Este link expira em <strong>24 horas</strong>.<br/>
                Se você não criou uma conta, ignore este e-mail.<br/>
                Ou copie e cole o link: <span style="color:#2563eb;word-break:break-all;">${verifyUrl}</span>
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM,
            to,
            subject: '✅ Confirme seu e-mail — TI Brodowski',
            html: baseTemplate('Verificação de E-mail', content),
        });
        return true;
    } catch (error) {
        console.error('[EMAIL] Erro ao enviar verificação:', error);
        return false;
    }
}

// ============================================================
// E-MAIL: CHAMADO ABERTO (para o solicitante)
// ============================================================
export async function sendTicketOpenedEmail(
    to: string,
    name: string,
    ticket: { protocol: string; subject: string; priority: string; location: string }
): Promise<boolean> {
    const ticketUrl = `${BASE_URL}/meus-chamados`;

    const priorityColors: Record<string, string> = {
        URGENTE: '#ef4444', ALTA: '#f59e0b', NORMAL: '#3b82f6', BAIXA: '#6b7280'
    };
    const color = priorityColors[ticket.priority] || '#3b82f6';

    const content = `
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Olá, ${name}</p>
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:900;">Chamado registrado</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
            Seu chamado foi registrado com sucesso e já está na fila de atendimento.
        </p>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding-bottom:12px;">
                        <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Protocolo</div>
                        <div style="color:#0f172a;font-size:18px;font-weight:900;font-family:monospace;">${ticket.protocol}</div>
                    </td>
                    <td style="padding-bottom:12px;text-align:right;">
                        <span style="background:${color}20;color:${color};padding:4px 12px;border-radius:20px;font-size:11px;font-weight:900;text-transform:uppercase;">${ticket.priority}</span>
                    </td>
                </tr>
                <tr><td colspan="2" style="border-top:1px solid #e2e8f0;padding-top:12px;">
                    <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Assunto</div>
                    <div style="color:#1e293b;font-size:14px;font-weight:700;">${ticket.subject}</div>
                </td></tr>
                ${ticket.location ? `
                <tr><td colspan="2" style="padding-top:10px;">
                    <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Local</div>
                    <div style="color:#1e293b;font-size:14px;">${ticket.location}</div>
                </td></tr>` : ''}
            </table>
        </div>

        <div style="text-align:center;margin-bottom:8px;">
            <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
                Acompanhar chamado
            </a>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM,
            to,
            subject: `📋 Chamado #${ticket.protocol} registrado — TI Brodowski`,
            html: baseTemplate('Chamado Registrado', content),
        });
        return true;
    } catch (error) {
        console.error('[EMAIL] Erro ao enviar confirmação de chamado:', error);
        return false;
    }
}

// ============================================================
// E-MAIL: TÉCNICO ATRIBUÍDO (para o solicitante)
// ============================================================
export async function sendTicketAssignedEmail(
    to: string,
    name: string,
    ticket: { protocol: string; subject: string },
    tecnico: string
): Promise<boolean> {
    const content = `
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Olá, ${name}</p>
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:900;">Técnico atribuído</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
            Seu chamado <strong>#${ticket.protocol}</strong> foi atribuído ao técnico <strong>${tecnico}</strong> e está sendo atendido.
        </p>
        <div style="background:#dbeafe;border-radius:10px;padding:14px 16px;border-left:4px solid #2563eb;">
            <p style="margin:0;color:#1e40af;font-size:13px;font-weight:700;">${ticket.subject}</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM,
            to,
            subject: `🔧 Técnico atribuído ao chamado #${ticket.protocol} — TI Brodowski`,
            html: baseTemplate('Técnico Atribuído', content),
        });
        return true;
    } catch (error) {
        console.error('[EMAIL] Erro ao enviar atribuição:', error);
        return false;
    }
}

// ============================================================
// E-MAIL: CHAMADO CONCLUÍDO (para o solicitante)
// ============================================================
export async function sendTicketClosedEmail(
    to: string,
    name: string,
    ticket: { protocol: string; subject: string },
    tecnico: string
): Promise<boolean> {
    const content = `
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Olá, ${name}</p>
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:900;">Chamado concluído! ✅</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
            Seu chamado <strong>#${ticket.protocol}</strong> foi concluído pelo técnico <strong>${tecnico}</strong>.
        </p>
        <div style="background:#d1fae5;border-radius:10px;padding:14px 16px;border-left:4px solid #10b981;margin-bottom:20px;">
            <p style="margin:0;color:#065f46;font-size:13px;font-weight:700;">${ticket.subject}</p>
        </div>
        <p style="color:#64748b;font-size:13px;">Se o problema persistir, abra um novo chamado pelo sistema.</p>
    `;

    try {
        await transporter.sendMail({
            from: FROM,
            to,
            subject: `✅ Chamado #${ticket.protocol} concluído — TI Brodowski`,
            html: baseTemplate('Chamado Concluído', content),
        });
        return true;
    } catch (error) {
        console.error('[EMAIL] Erro ao enviar conclusão:', error);
        return false;
    }
}

// ============================================================
// E-MAIL: NOVO CHAMADO DISPONÍVEL (para técnicos)
// ============================================================
export async function sendNewTicketNotificationEmail(
    tecnicos: string[],
    ticket: { protocol: string; subject: string; priority: string; location: string; department: string }
): Promise<boolean> {
    if (!tecnicos.length) return true;

    const priorityColors: Record<string, string> = {
        URGENTE: '#ef4444', ALTA: '#f59e0b', NORMAL: '#3b82f6', BAIXA: '#6b7280'
    };
    const color = priorityColors[ticket.priority] || '#3b82f6';
    const ticketUrl = `${BASE_URL}/tecnico`;

    const content = `
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:900;">Novo chamado disponível</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;">Um novo chamado está aguardando atendimento.</p>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Protocolo</div>
                        <div style="font-size:16px;font-weight:900;font-family:monospace;color:#0f172a;">${ticket.protocol}</div>
                    </td>
                    <td style="text-align:right;">
                        <span style="background:${color}20;color:${color};padding:4px 12px;border-radius:20px;font-size:11px;font-weight:900;text-transform:uppercase;">${ticket.priority}</span>
                    </td>
                </tr>
                <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #e2e8f0;margin-top:12px;">
                    <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Assunto</div>
                    <div style="font-weight:700;color:#1e293b;">${ticket.subject}</div>
                </td></tr>
                <tr><td colspan="2" style="padding-top:8px;">
                    <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Secretaria</div>
                    <div style="color:#1e293b;">${ticket.department}</div>
                </td></tr>
                ${ticket.location ? `<tr><td colspan="2" style="padding-top:8px;">
                    <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Local</div>
                    <div style="color:#1e293b;">${ticket.location}</div>
                </td></tr>` : ''}
            </table>
        </div>

        <div style="text-align:center;">
            <a href="${ticketUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
                Ver painel técnico
            </a>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: FROM,
            to: tecnicos.join(', '),
            subject: `🔔 Novo chamado #${ticket.protocol} — ${ticket.priority} — TI Brodowski`,
            html: baseTemplate('Novo Chamado', content),
        });
        return true;
    } catch (error) {
        console.error('[EMAIL] Erro ao notificar técnicos:', error);
        return false;
    }
}

// ============================================================
// E-MAIL: VISITA AGENDADA (para o solicitante)
// ============================================================
export async function sendVisitScheduledEmail(
    to: string,
    name: string,
    ticket: { protocol: string; subject: string },
    visitDate: string,
    tecnico: string,
    note?: string
): Promise<boolean> {
    const content = `
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Olá, ${name}</p>
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:900;">Visita técnica agendada 📅</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
            Uma visita técnica foi agendada para o seu chamado <strong>#${ticket.protocol}</strong>.
        </p>
        <div style="background:#eff6ff;border-radius:12px;padding:20px;border:1px solid #bfdbfe;margin-bottom:20px;">
            <div style="color:#1e40af;font-size:18px;font-weight:900;margin-bottom:8px;">${visitDate}</div>
            <div style="color:#3b82f6;font-size:13px;">Técnico responsável: <strong>${tecnico}</strong></div>
            ${note ? `<div style="color:#64748b;font-size:12px;margin-top:8px;padding-top:8px;border-top:1px solid #bfdbfe;">${note}</div>` : ''}
        </div>
        <p style="color:#64748b;font-size:12px;">Por favor, esteja presente ou avise caso não possa. Chamado: <strong>${ticket.subject}</strong></p>
    `;

    try {
        await transporter.sendMail({
            from: FROM,
            to,
            subject: `📅 Visita agendada para #${ticket.protocol} — TI Brodowski`,
            html: baseTemplate('Visita Agendada', content),
        });
        return true;
    } catch (error) {
        console.error('[EMAIL] Erro ao enviar visita:', error);
        return false;
    }
}