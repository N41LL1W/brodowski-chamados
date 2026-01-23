import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET: Retorna os detalhes completos do chamado + Comentários
 * Usado na página de Detalhes do Chamado
 */
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;

        const ticket = await (prisma as any).ticket.findUnique({
            where: { id },
            include: {
                requester: { select: { name: true, email: true } },
                category: true,
                department: true,
                assignedTo: { select: { name: true } },
                comments: {
                    include: { user: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error("Erro ao buscar detalhes:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}

/**
 * POST: Adiciona uma nova mensagem (comentário) ao chamado
 */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        const { content } = await req.json();

        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const userId = (session.user as any).id;

        const comment = await (prisma as any).comment.create({
            data: { 
                content, 
                ticketId: id, 
                userId 
            },
            include: { 
                user: { select: { name: true, role: true } } 
            }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PATCH: Atualiza o status ou assume o chamado
 */
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = await props.params;
        const body = await req.json();
        const user = session.user as any;

        // Lógica de Atualização Flexível
        const updateData: any = {};

        if (body.action === 'ASSUMIR') {
            updateData.status = 'EM_ANDAMENTO';
            updateData.assignedToId = user.id;
        } else if (body.action === 'FINALIZAR') {
            updateData.status = 'CONCLUIDO';
        } else {
            // Se não for uma ação rápida, aceita o que vier no body
            if (body.status) updateData.status = body.status;
            if (body.assignedToId) updateData.assignedToId = body.assignedToId;
        }

        const updatedTicket = await (prisma as any).ticket.update({
            where: { id },
            data: updateData,
            include: {
                assignedTo: { select: { name: true } }
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        console.error("Erro no PATCH Ticket:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}