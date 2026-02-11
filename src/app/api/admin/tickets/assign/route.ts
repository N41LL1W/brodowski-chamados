import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        // 1. Verificação de Autorização (Apenas Master e Controlador podem delegar)
        if (!session || !['MASTER', 'CONTROLADOR'].includes(userRole)) {
            return new NextResponse('Acesso negado: permissão insuficiente.', { status: 403 });
        }

        const body = await request.json();
        const { ticketId, technicianId } = body;

        // 2. Validação de dados básicos
        if (!ticketId) {
            return new NextResponse('O ID do chamado é obrigatório.', { status: 400 });
        }

        // 3. Atualização no Banco de Dados
        // Se technicianId for null, o chamado volta para "ABERTO"
        // Se houver technicianId, o status vai para "EM_ANDAMENTO"
        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId }, 
            data: {
                assignedToId: technicianId || null,
                status: technicianId ? "EM_ANDAMENTO" : "ABERTO",
                updatedAt: new Date()
            },
            include: {
                assignedTo: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({
            message: technicianId ? "Técnico atribuído com sucesso." : "Chamado liberado para fila de espera.",
            ticket: updatedTicket
        });

    } catch (error: any) {
        console.error("ERRO_ASSIGN_TICKET:", error);
        return new NextResponse('Erro interno ao processar atribuição.', { status: 500 });
    }
}