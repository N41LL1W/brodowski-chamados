import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Busca todas as Roles e Levels
export async function GET() {
    try {
        const [roles, levels] = await Promise.all([
            prisma.role.findMany({ orderBy: { name: 'asc' } }),
            prisma.level.findMany({ orderBy: { rank: 'asc' } })
        ]);
        
        return NextResponse.json({ roles, levels });
    } catch (error) {
        console.error("Erro ao buscar opções:", error);
        return NextResponse.json({ roles: [], levels: [] }, { status: 500 });
    }
}

// POST: Cria nova Role ou Level
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { type, name, rank } = await req.json();

        if (type === 'role') {
            const newRole = await prisma.role.create({ data: { name } });
            return NextResponse.json(newRole);
        } 
        
        if (type === 'level') {
            const newLevel = await prisma.level.create({ 
                data: { name, rank: parseInt(rank) || 1 } 
            });
            return NextResponse.json(newLevel);
        }

        return new NextResponse('Tipo inválido', { status: 400 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao criar opção" }, { status: 500 });
    }
}

// DELETE: Remove Role ou Level
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');

        if (!id || !type) {
            return NextResponse.json({ message: "ID e Tipo são obrigatórios" }, { status: 400 });
        }

        const numericId = parseInt(id);

        if (type === 'role') {
            // Verifica se existem usuários usando esta role antes de deletar
            const count = await prisma.user.count({ where: { roleId: numericId } });
            if (count > 0) {
                return NextResponse.json(
                    { message: `Existem ${count} usuários vinculados a este cargo. Remova-os primeiro.` }, 
                    { status: 400 }
                );
            }
            await prisma.role.delete({ where: { id: numericId } });
        } else if (type === 'level') {
            // Verifica se existem usuários usando este level
            const count = await prisma.user.count({ where: { levelId: numericId } });
            if (count > 0) {
                return NextResponse.json(
                    { message: `Existem ${count} usuários vinculados a este nível. Remova-os primeiro.` }, 
                    { status: 400 }
                );
            }
            await prisma.level.delete({ where: { id: numericId } });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erro ao excluir:", error);
        return NextResponse.json(
            { message: "Erro ao excluir. Verifique se a opção está sendo usada." }, 
            { status: 500 }
        );
    }
}