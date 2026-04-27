import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true, name: true, email: true,
            role: true, image: true,
            active: true,
            _count: { select: { tickets: true, comments: true } }
        }
    });
    return NextResponse.json(users);
}

export async function PATCH(req: Request) {
    const master = await checkMaster();
    if (!master) return new NextResponse('Não autorizado', { status: 403 });

    const { id, name, email, role, active, newPassword } = await req.json();
    const data: any = {};
    if (name !== undefined)    data.name   = name;
    if (email !== undefined)   data.email  = email;
    if (role !== undefined)    data.role   = role;
    if (active !== undefined)  data.active = active;
    if (newPassword?.trim())   data.passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
}

export async function DELETE(req: Request) {
    const master = await checkMaster();
    if (!master) return new NextResponse('Não autorizado', { status: 403 });

    const { id } = await req.json();
    if (id === (master as any).id) {
        return NextResponse.json({ message: 'Não pode excluir a própria conta.' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
}