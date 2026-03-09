import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 401 });
    const user = session.user as any;

    try {
        // 1. Fila de Espera: ABERTOS e sem ninguém cuidando
        const disponiveis = await prisma.ticket.findMany({
            where: { 
                status: 'OPEN', 
                assignedToId: null 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Trabalhos Ativos: EM_ANDAMENTO e atribuídos a MIM
        // Nota: Se um chamado sumiu, verifique se ao 'PAUSAR' você não está mudando o status para algo diferente de EM_ANDAMENTO
        const meusTrabalhos = await prisma.ticket.findMany({
            where: { 
                assignedToId: user.id,
                status: 'IN_PROGRESS' 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { updatedAt: 'desc' }
        });

        // 3. Finalizados: Apenas os CONCLUÍDOS por MIM
        const finalizados = await prisma.ticket.findMany({
            where: { 
                assignedToId: user.id,
                status: 'CONCLUIDO' 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { updatedAt: 'desc' },
            take: 12
        });

        return NextResponse.json({ disponiveis, meusTrabalhos, finalizados });
    } catch (error) {
        console.error("Erro na API de Admin:", error);
        return NextResponse.json({ error: "Erro ao carregar painel" }, { status: 500 });
    }
}

// O POST permanece igual, apenas garanto a estrutura
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = await prisma.ticket.create({
            data: {
                protocol,
                subject: body.subject,
                description: body.description,
                location: body.location,
                priority: body.priority || "NORMAL",
                status: "ABERTO",
                requesterId: body.requesterId || (session?.user as any).id,
                categoryId: body.categoryId,
                departmentId: body.departmentId,
            },
        });

        return NextResponse.json(newTicket);
    } catch (error: any) {
        return NextResponse.json({ message: "Erro ao criar", details: error.message }, { status: 500 });
    }
}