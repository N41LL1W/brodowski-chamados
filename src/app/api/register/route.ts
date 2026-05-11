import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Dados incompletos.' }, { status: 400 });
        }

        // Verifica configs
        const configs = await prisma.systemConfig.findMany({
            where: { key: { in: ['registrationOpen', 'allowedDomain', 'emailVerificationRequired'] } }
        });
        const cfg: Record<string, string> = {};
        configs.forEach(c => { cfg[c.key] = c.value; });

        if (cfg.registrationOpen === 'false') {
            return NextResponse.json({ message: 'Auto-registro desativado. Contate o administrador.' }, { status: 403 });
        }

        const domain = cfg.allowedDomain?.trim();
        if (domain) {
            const emailDomain = email.split('@')[1]?.toLowerCase();
            if (emailDomain !== domain.toLowerCase()) {
                return NextResponse.json({ message: `Apenas e-mails @${domain} podem se registrar.` }, { status: 403 });
            }
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ message: 'E-mail já cadastrado.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const requireVerification = cfg.emailVerificationRequired !== 'false';

        const newUser = await prisma.user.create({
            data: {
                name, email, passwordHash,
                role: 'FUNCIONARIO',
                // Se verificação obrigatória, emailVerified fica null até confirmar
                emailVerified: requireVerification ? null : new Date(),
            }
        });

        if (requireVerification) {
            // Gera token de verificação
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

            await (prisma as any).emailVerification.create({
                data: { userId: newUser.id, token, expiresAt }
            });

            // Por enquanto retorna o link de verificação na resposta
            // Em produção, enviar por e-mail via SMTP
            const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verificar-email?token=${token}`;

            return NextResponse.json({
                id: newUser.id,
                email: newUser.email,
                needsVerification: true,
                // Em dev, retorna o link. Em prod, enviar por e-mail
                verifyUrl: process.env.NODE_ENV === 'development' ? verifyUrl : undefined,
                message: 'Conta criada! Verifique seu e-mail para ativar o acesso.'
            }, { status: 201 });
        }

        return NextResponse.json({ id: newUser.id, email: newUser.email }, { status: 201 });

    } catch (error: any) {
        console.error('ERRO NO REGISTRO:', error);
        return NextResponse.json({ message: 'Erro interno.', details: error.message }, { status: 500 });
    }
}