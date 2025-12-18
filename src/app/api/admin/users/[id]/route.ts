import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Apenas MASTER pode excluir usuários
    if (!session || userRole !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        // CORREÇÃO AQUI: Não use parseInt se o seu ID no banco for String
        const userId = params.id; 

        // Impede que o Master exclua a si mesmo
        // Usamos String() para garantir que a comparação seja entre duas strings
        if (userId === String((session.user as any).id)) {
            return new NextResponse('Você não pode excluir sua própria conta.', { status: 400 });
        }

        await prisma.user.delete({
            where: { id: userId }, // Agora o tipo bate com o que o Prisma espera
        });

        return new NextResponse('Usuário removido', { status: 200 });
    } catch (error) {
        console.error("Erro ao excluir:", error);
        return new NextResponse('Erro ao excluir usuário', { status: 500 });
    }
}