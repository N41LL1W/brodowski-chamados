import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { id: true, name: true, email: true, role: true, image: true, createdAt: true }
    });

    return NextResponse.json(user);
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const { name, currentPassword, newPassword } = await req.json();
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new NextResponse('Usuário não encontrado', { status: 404 });

    const updateData: any = {};

    if (name && name !== user.name) {
        updateData.name = name;
    }

    if (newPassword) {
        if (!currentPassword) {
            return NextResponse.json({ message: 'Informe a senha atual.' }, { status: 400 });
        }
        const valid = await bcrypt.compare(currentPassword, user.passwordHash || '');
        if (!valid) {
            return NextResponse.json({ message: 'Senha atual incorreta.' }, { status: 400 });
        }
        updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'Nenhuma alteração detectada.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json(updated);
}