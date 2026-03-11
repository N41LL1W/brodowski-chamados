import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 401 });
    const user = session.user as any;

    try {
        const [disponiveis, meusTrabalhos, pausados, finalizados] = await Promise.all([
            // 1. Aguardando (Novos chamados na fila)
            prisma.ticket.findMany({
                where: { status: 'OPEN', assignedToId: null },
                include: { requester: true, category: true, department: true },
                orderBy: { createdAt: 'desc' }
            }),
            // 2. Em Andamento (Atribuídos a mim e ativos)
            prisma.ticket.findMany({
                where: { status: 'IN_PROGRESS', assignedToId: user.id },
                include: { requester: true, category: true, department: true },
                orderBy: { updatedAt: 'desc' }
            }),
            // 3. Pausados (Atribuídos a mim e em pausa)
            prisma.ticket.findMany({
                where: { status: 'EM_PAUSA', assignedToId: user.id },
                include: { requester: true, category: true, department: true },
                orderBy: { updatedAt: 'desc' }
            }),
            // 4. Finalizados (Histórico recente)
            prisma.ticket.findMany({
                where: { 
                    assignedToId: user.id,
                    status: { in: ['CONCLUDED', 'CONCLUIDO'] } 
                },
                include: { requester: true, category: true, department: true },
                orderBy: { updatedAt: 'desc' },
                take: 6 // Apenas os últimos 6 para não poluir
            })
        ]);

        return NextResponse.json({ disponiveis, meusTrabalhos, pausados, finalizados });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 });
    }
}