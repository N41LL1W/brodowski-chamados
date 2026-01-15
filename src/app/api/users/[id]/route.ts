// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PATCH: Atualiza Role e Level (Nível) do usuário
export async function PATCH(
    req: Request, 
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Segurança: Apenas MASTER pode alterar outros usuários
    if (!session || userRole !== 'MASTER') {
        return new NextResponse('Acesso restrito ao Administrador Master', { status: 403 });
    }

    try {
        const { role, level } = await req.json();
        const userId = parseInt(params.id);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                role: role,
                level: level 
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return NextResponse.json({ message: "Erro ao processar atualização" }, { status: 500 });
    }
}

// DELETE: Remove um usuário do sistema
export async function DELETE(
    req: Request, 
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const userId = parseInt(params.id);
        
        // Evitar que o Master se exclua acidentalmente
        if (userId === (session.user as any).id) {
            return NextResponse.json({ message: "Você não pode excluir sua própria conta Master" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        return new NextResponse('Usuário removido com sucesso', { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao excluir usuário" }, { status: 500 });
    }
}