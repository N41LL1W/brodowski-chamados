import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const items = await (prisma as any).categoryConfig.findMany({
        orderBy: { order: 'asc' }
    });
    return NextResponse.json(items);
}

export async function PUT(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const items = await req.json();

    // Deleta todos e recria na ordem certa
    await (prisma as any).categoryConfig.deleteMany({});
    await (prisma as any).categoryConfig.createMany({
        data: items.map((item: any, i: number) => ({
            id: item.id?.startsWith('new_') ? undefined : item.id,
            name: item.name,
            icon: item.icon || 'Monitor',
            order: i,
            active: item.active ?? true
        }))
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { id } = await req.json();
    await (prisma as any).categoryConfig.delete({ where: { id } });
    return NextResponse.json({ success: true });
}