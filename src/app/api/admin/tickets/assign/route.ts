import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // 1. Verificação de Autorização
    if (!session || !['MASTER', 'CONTROLADOR'].includes(userRole)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const body = await request.json();
        // Pegamos o ticketId e o technicianId de dentro do corpo do JSON enviado pelo formulário
        const { ticketId, technicianId } = body;

        if (!ticketId) {
            return new NextResponse('ID do ticket é obrigatório', { status: 400 });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: Number(ticketId) }, 
            data: {
                assignedToId: technicianId,
                status: technicianId ? "Em Atendimento" : "Aberto"
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Erro na atribuição:", error);
        return new NextResponse('Erro ao atribuir técnico', { status: 500 });
    }
}