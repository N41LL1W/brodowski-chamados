import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Dados incompletos.' }, { status: 400 });
        }

        // Verifica configs do sistema
        const configs = await prisma.systemConfig.findMany({
            where: { key: { in: ['registrationOpen', 'allowedDomain'] } }
        });

        const configMap: Record<string, string> = {};
        configs.forEach(c => { configMap[c.key] = c.value; });

        // Verifica se registro está aberto
        if (configMap.registrationOpen === 'false') {
            return NextResponse.json({
                message: 'O auto-registro está desativado. Entre em contato com o administrador.'
            }, { status: 403 });
        }

        // Verifica domínio de e-mail
        const allowedDomain = configMap.allowedDomain?.trim();
        if (allowedDomain) {
            const emailDomain = email.split('@')[1]?.toLowerCase();
            if (emailDomain !== allowedDomain.toLowerCase()) {
                return NextResponse.json({
                    message: `Apenas e-mails @${allowedDomain} podem se registrar.`
                }, { status: 403 });
            }
        }

        // Verifica se já existe
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ message: 'E-mail já cadastrado.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, passwordHash, role: 'FUNCIONARIO' }
        });

        return NextResponse.json({ id: newUser.id, email: newUser.email }, { status: 201 });

    } catch (error: any) {
        console.error('ERRO NO REGISTRO:', error);
        return NextResponse.json({ message: 'Erro interno.' }, { status: 500 });
    }
}