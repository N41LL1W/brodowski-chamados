import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Retorna listas separadas para o Técnico
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Não autorizado', { status: 401 });
    
    const user = session.user as any;

    try {
        // 1. Chamados que NINGUÉM assumiu ainda
        const disponiveis = await prisma.ticket.findMany({
            where: { status: 'ABERTO', assignedToId: null },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Chamados que EU (Técnico Logado) assumi
        const meusTrabalhos = await prisma.ticket.findMany({
            where: { assignedToId: user.id },
            include: { requester: true, category: true, department: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ disponiveis, meusTrabalhos });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao carregar painel" }, { status: 500 });
    }
}

// POST: Permite ao Admin criar chamados em nome de outros
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { subject, description, priority, categoryId, departmentId, requesterId } = await req.json();

        const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = await (prisma as any).ticket.create({
            data: {
                protocol,
                subject,
                description,
                priority: priority || "NORMAL",
                status: "ABERTO",
                requesterId: requesterId || (session?.user as any).id,
                categoryId,
                departmentId,
            },
        });

        return NextResponse.json(newTicket);
    } catch (error: any) {
        return NextResponse.json({ message: "Erro ao criar", details: error.message }, { status: 500 });
    }
}