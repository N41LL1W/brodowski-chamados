import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== 'MASTER') {
        return new NextResponse('Apenas o MASTER pode excluir usuários.', { status: 403 });
    }

    if (id === (session.user as any).id) {
        return new NextResponse('Erro: Você não pode se auto-excluir.', { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { id } });
        return new NextResponse('Usuário removido.', { status: 200 });
    } catch (e) { return new NextResponse('Erro ao remover.', { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    
    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                role: body.role,
                roleId: body.roleId ? Number(body.roleId) : undefined,
                levelId: body.levelId ? Number(body.levelId) : undefined,
            }
        });
        return NextResponse.json(user);
    } catch (e) { return new NextResponse('Erro ao atualizar.', { status: 500 }); }
}