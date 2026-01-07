import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Observe que a função continua async
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Tipamos como Promise
) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // 1. Unwraps (desembrulha) o params primeiro
    const { id } = await params; 

    // Segurança: Apenas MASTER pode deletar usuários
    if (!session || userRole !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        // 2. Impede que o Master se exclua acidentalmente
        // Convertemos ambos para String para garantir a comparação
        if (id === String((session.user as any).id)) {
            return new NextResponse('Você não pode excluir sua própria conta.', { status: 400 });
        }

        // 3. Agora o 'id' existe e não é undefined
        await prisma.user.delete({
            where: { id: id },
        });

        return new NextResponse('Usuário removido com sucesso', { status: 200 });
    } catch (error) {
        console.error("Erro no Prisma:", error);
        return new NextResponse('Erro interno ao excluir', { status: 500 });
    }
}