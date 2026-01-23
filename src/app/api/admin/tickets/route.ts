import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 401 });
    const user = session.user as any;

    try {
        // 1. Fila de Espera: Apenas ABERTOS e sem técnico atribuído
        const disponiveis = await prisma.ticket.findMany({
            where: { 
                status: 'ABERTO', 
                assignedToId: null 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Trabalhos Ativos: Chamados do técnico logado que estão EM ANDAMENTO
        const meusTrabalhos = await prisma.ticket.findMany({
            where: { 
                assignedToId: user.id,
                status: 'EM_ANDAMENTO' // Filtro específico para o que está rolando agora
            },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Finalizados: Histórico de chamados CONCLUÍDOS pelo técnico logado
        const finalizados = await prisma.ticket.findMany({
            where: { 
                assignedToId: user.id,
                status: 'CONCLUIDO' 
            },
            include: { requester: true, category: true, department: true },
            orderBy: { updatedAt: 'desc' }, // Ordenar pela data de conclusão (última atualização)
            take: 10 // Opcional: Limitar aos últimos 10 para não sobrecarregar a tela
        });

        return NextResponse.json({ disponiveis, meusTrabalhos, finalizados });
    } catch (error) {
        console.error("Erro na API de Admin:", error);
        return NextResponse.json({ error: "Erro ao carregar painel" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        
        // Gerador de protocolo robusto
        const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = await (prisma as any).ticket.create({
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
        console.error("Erro ao criar chamado:", error);
        return NextResponse.json({ message: "Erro ao criar", details: error.message }, { status: 500 });
    }
}