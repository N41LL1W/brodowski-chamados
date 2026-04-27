import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const perms = await (prisma as any).rolePermission.findMany();
    const map: Record<string, any> = {};
    perms.forEach((p: any) => {
        try { map[p.role] = JSON.parse(p.permissions); }
        catch { map[p.role] = {}; }
    });
    return NextResponse.json(map);
}

export async function POST(req: Request) {
    const master = await checkMaster();
    if (!master) return new NextResponse('Não autorizado', { status: 403 });

    const { role, permissions } = await req.json();
    const result = await (prisma as any).rolePermission.upsert({
        where: { role },
        update: { permissions: JSON.stringify(permissions) },
        create: { role, permissions: JSON.stringify(permissions) }
    });
    return NextResponse.json(result);
}

export async function DELETE(req: Request) {
    const master = await checkMaster();
    if (!master) return new NextResponse('Não autorizado', { status: 403 });

    const { role } = await req.json();
    const fixed = ['FUNCIONARIO', 'TECNICO', 'CONTROLADOR', 'MASTER'];
    if (fixed.includes(role)) {
        return NextResponse.json({ message: 'Não pode excluir roles fixas do sistema.' }, { status: 400 });
    }
    await (prisma as any).rolePermission.delete({ where: { role } });
    return NextResponse.json({ success: true });
}