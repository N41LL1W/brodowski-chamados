import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Busca os comentários do chamado
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const comments = await (prisma as any).comment.findMany({
            where: { ticketId: id },
            include: { 
                user: { select: { name: true, role: true } } 
            },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json([]);
    }
}

// POST: Cria um novo comentário
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        const { content } = await req.json();
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const userId = (session.user as any).id;
        const comment = await (prisma as any).comment.create({
            data: { content, ticketId: id, userId },
            include: { user: { select: { name: true, role: true } } }
        });
        return NextResponse.json(comment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Assumir ou Alterar Status do Chamado (O que faltava!)
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = await props.params;
        const body = await req.json();
        const user = session.user as any;

        const updatedTicket = await (prisma as any).ticket.update({
            where: { id },
            data: {
                status: body.status || undefined,
                assignedToId: body.assignedToId || undefined,
                // Se estiver assumindo, define o técnico logado
                ...(body.action === 'ASSUMIR' && {
                    status: 'EM_ANDAMENTO',
                    assignedToId: user.id
                })
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}