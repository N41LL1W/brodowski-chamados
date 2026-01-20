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
        const { ticketId, technicianId } = body;

        if (!ticketId) {
            return new NextResponse('ID do ticket é obrigatório', { status: 400 });
        }

        const updatedTicket = await prisma.ticket.update({
            // CORREÇÃO: Removido o Number(), pois ticketId agora é String
            where: { id: ticketId }, 
            data: {
                assignedToId: technicianId || null,
                // CORREÇÃO: Usando os status em MAIÚSCULO para bater com o Schema e a Barra de Progresso
                status: technicianId ? "ATENDIMENTO" : "ABERTO"
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        console.error("Erro na atribuição:", error);
        return new NextResponse('Erro ao atribuir técnico: ' + error.message, { status: 500 });
    }
}