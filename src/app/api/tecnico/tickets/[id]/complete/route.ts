import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
        return new NextResponse('Não autorizado', { status: 401 });
    }

    try {
        const updatedTicket = await prisma.ticket.update({
            where: { 
                id: id, // CORREÇÃO: Removido o Number()
                assignedToId: (session.user as any).id 
            },
            data: { 
                status: "CONCLUIDO" // CORREÇÃO: Alinhado com o padrão da barra de progresso
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Erro técnico complete:", error);
        return new NextResponse('Erro ao concluir chamado', { status: 500 });
    }
}