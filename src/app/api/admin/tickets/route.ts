import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 401 });
    
    const user = session.user as any;

    try {
        // 1. Apenas chamados ABERTOS e sem técnico (Fila de espera)
        const disponiveis = await prisma.ticket.findMany({
            where: { 
                status: 'ABERTO', 
                assignedToId: null 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Chamados que o técnico assumiu e que NÃO estão concluídos
        const meusTrabalhos = await prisma.ticket.findMany({
            where: { 
                assignedToId: user.id,
                status: { not: 'CONCLUIDO' } // Não mostra os já finalizados aqui
            },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ disponiveis, meusTrabalhos });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao carregar painel" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();

        // Protocolo Brodowski
        const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = await (prisma as any).ticket.create({
            data: {
                protocol,
                subject: body.subject,
                description: body.description,
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