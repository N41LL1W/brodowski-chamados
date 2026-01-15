import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PATCH: Atualiza Usuário
export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> } // Agora é uma Promise
) {
    const session = await getServerSession(authOptions);
    const myRole = (session?.user as any)?.role;

    if (!session || myRole !== 'MASTER') {
        return new NextResponse('Acesso restrito', { status: 403 });
    }

    try {
        // Aguarda os parâmetros da URL
        const { id } = await params; 
        const { roleId, levelId, roleName } = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { 
                roleId: roleId ? parseInt(roleId) : undefined,
                levelId: levelId ? parseInt(levelId) : undefined,
                role: roleName 
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao atualizar banco" }, { status: 500 });
    }
}

// DELETE: Exclui Usuário
export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const myRole = (session?.user as any)?.role;

    if (!session || myRole !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { id } = await params;

        if (id === (session.user as any).id) {
            return NextResponse.json({ message: "Não pode excluir a si mesmo" }, { status: 400 });
        }

        await prisma.user.delete({ where: { id: id } });
        return new NextResponse('Removido', { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao excluir" }, { status: 500 });
    }
}