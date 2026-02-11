import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const [categories, departments, roles, levels] = await Promise.all([
            prisma.category.findMany({ orderBy: { name: 'asc' } }),
            prisma.department.findMany({ orderBy: { name: 'asc' } }),
            prisma.role.findMany({ orderBy: { name: 'asc' } }),
            prisma.level.findMany({ orderBy: { rank: 'asc' } })
        ]);
        return NextResponse.json({ categories, departments, roles, levels });
    } catch (e) { return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 }); }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') return new NextResponse('Apenas Master', { status: 403 });

    try {
        const { type, name, rank, icon } = await req.json();
        const customId = `${type.slice(0, 3)}_${Date.now()}`;

        switch (type) {
            case 'category':
                return NextResponse.json(await prisma.category.create({ data: { id: customId, name, icon: icon || "Wrench" } }));
            case 'department':
                return NextResponse.json(await prisma.department.create({ data: { id: customId, name } }));
            case 'role':
                return NextResponse.json(await prisma.role.create({ data: { name } }));
            case 'level':
                return NextResponse.json(await prisma.level.create({ data: { name, rank: Number(rank) } }));
            default:
                return new NextResponse('Tipo inválido', { status: 400 });
        }
    } catch (error: any) { return NextResponse.json({ message: error.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') return new NextResponse('Não autorizado', { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) return new NextResponse('Dados faltantes', { status: 400 });

    try {
        if (type === 'category') await prisma.category.delete({ where: { id } });
        else if (type === 'department') await prisma.department.delete({ where: { id } });
        else if (type === 'role') await prisma.role.delete({ where: { id: Number(id) } });
        else if (type === 'level') await prisma.level.delete({ where: { id: Number(id) } });

        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ message: "Item em uso. Não pode ser excluído." }, { status: 400 }); }
}