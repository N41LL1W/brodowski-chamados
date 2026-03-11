import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 401 });
    const user = session.user as any;

    try {
        // 1. DISPONÍVEIS: Status 'OPEN' e ninguém assumiu
        const disponiveis = await prisma.ticket.findMany({
            where: { status: 'OPEN', assignedToId: null },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. EM ATENDIMENTO: Status 'IN_PROGRESS' e atribuído a MIM
        const meusTrabalhos = await prisma.ticket.findMany({
            where: { status: 'IN_PROGRESS', assignedToId: user.id },
            include: { requester: true, category: true, department: true },
            orderBy: { updatedAt: 'desc' }
        });

        // 3. PAUSADOS: Status 'EM_PAUSA' e atribuído a MIM
        const pausados = await prisma.ticket.findMany({
            where: { status: 'EM_PAUSA', assignedToId: user.id },
            include: { requester: true, category: true, department: true },
            orderBy: { updatedAt: 'desc' }
        });

        // 4. FINALIZADOS: Status 'CONCLUDED' ou 'CONCLUIDO' (adicionei ambos por segurança)
        const finalizados = await prisma.ticket.findMany({
            where: { 
                assignedToId: user.id,
                status: { in: ['CONCLUDED', 'CONCLUIDO'] } 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });

        return NextResponse.json({ disponiveis, meusTrabalhos, pausados, finalizados });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 });
    }
}