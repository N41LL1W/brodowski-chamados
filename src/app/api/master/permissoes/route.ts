import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const perms = await prisma.rolePermission.findMany();
    const map: Record<string, any> = {};
    perms.forEach(p => {
        try { map[p.role] = JSON.parse(p.permissions); }
        catch { map[p.role] = {}; }
    });
    return NextResponse.json(map);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { role, permissions } = await req.json();
    const result = await prisma.rolePermission.upsert({
        where: { role },
        update: { permissions: JSON.stringify(permissions) },
        create: { role, permissions: JSON.stringify(permissions) }
    });
    return NextResponse.json(result);
}