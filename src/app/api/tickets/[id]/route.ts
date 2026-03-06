import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const userId = (session.user as any).id;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                requester: { select: { id: true, name: true } },
                category: true,
                department: true,
                assignedTo: { select: { name: true } },
                comments: {
                    include: { user: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) return NextResponse.json({ message: "Não encontrado" }, { status: 404 });

        // SEGURANÇA: Só quem abriu o chamado pode ver os detalhes nesta rota
        if (ticket.requesterId !== userId) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        const { content } = await req.json();

        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });
        const userId = (session.user as any).id;

        const ticket = await prisma.ticket.findUnique({ where: { id }, select: { requesterId: true } });
        
        // Só comenta no PRÓPRIO chamado nesta página
        if (ticket?.requesterId !== userId) {
            return new NextResponse('Acesso negado', { status: 403 });
        }

        const comment = await prisma.comment.create({
            data: { content, ticketId: id, userId },
            include: { user: { select: { name: true, role: true } } }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = await props.params;
        const body = await req.json();

        // O PATCH aqui normalmente seria usado apenas pelo dono para cancelar ou atualizar algo
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}