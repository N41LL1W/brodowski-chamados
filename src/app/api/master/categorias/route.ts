import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const items = await prisma.categoryConfig.findMany({
        orderBy: { order: 'asc' }
    });
    return NextResponse.json(items);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { name, icon, order } = await req.json();
    const item = await prisma.categoryConfig.create({
        data: { name, icon: icon || 'Monitor', order: order || 0 }
    });
    return NextResponse.json(item);
}

export async function PUT(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const items = await req.json(); // array completo
    await prisma.$transaction(
        items.map((item: any) =>
            prisma.categoryConfig.upsert({
                where: { id: item.id || 'new' },
                update: { name: item.name, icon: item.icon, order: item.order, active: item.active },
                create: { name: item.name, icon: item.icon, order: item.order, active: item.active }
            })
        )
    );
    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { id } = await req.json();
    await prisma.categoryConfig.delete({ where: { id } });
    return NextResponse.json({ success: true });
}