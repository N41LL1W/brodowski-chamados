import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendVerificationEmail } from '@/lib/email';

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 401 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST;

    if (!smtpUser || !smtpPass) {
        return NextResponse.json({
            error: 'Variáveis SMTP não configuradas',
            smtpUser: smtpUser ? '✅ definido' : '❌ faltando',
            smtpPass: smtpPass ? '✅ definido' : '❌ faltando',
            smtpHost: smtpHost || 'smtp.gmail.com (padrão)',
        });
    }

    const sent = await sendVerificationEmail(
        smtpUser, // envia para o próprio e-mail como teste
        'Teste SMTP',
        'token-teste-123'
    );

    return NextResponse.json({
        success: sent,
        smtpUser,
        smtpHost: smtpHost || 'smtp.gmail.com',
        message: sent
            ? 'E-mail enviado com sucesso! Verifique a caixa de entrada.'
            : 'Falha ao enviar. Verifique os logs da Vercel.'
    });
}