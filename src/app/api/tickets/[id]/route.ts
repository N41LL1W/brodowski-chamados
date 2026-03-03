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
        const userRole = (session.user as any).role;

        const ticket = await prisma.ticket.findUnique({
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

        // --- VALIDAÇÃO DE PRIVACIDADE ---
        const isOwner = ticket.requesterId === userId;
        const isStaff = ["MASTER", "CONTROLADOR", "TECNICO", "ADMIN"].includes(userRole);

        if (!isOwner && !isStaff) {
            return NextResponse.json({ message: "Acesso negado: Este chamado pertence a outro usuário." }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error("Erro ao buscar detalhes:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        const { content } = await req.json();

        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const userId = (session.user as any).id;

        // Verifica se o usuário tem permissão para comentar neste chamado
        const ticket = await prisma.ticket.findUnique({ where: { id }, select: { requesterId: true } });
        const userRole = (session.user as any).role;
        const isStaff = ["MASTER", "CONTROLADOR", "TECNICO", "ADMIN"].includes(userRole);

        if (ticket?.requesterId !== userId && !isStaff) {
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
        const user = session.user as any;

        const updateData: any = {};

        switch (body.action) {
            case 'ASSUMIR':
                updateData.status = 'EM_ANDAMENTO';
                updateData.assignedToId = user.id;
                break;
            case 'FINALIZAR':
                updateData.status = 'CONCLUIDO';
                if (body.proofImage) updateData.proofImage = body.proofImage;
                break;
            case 'PAUSAR':
                updateData.status = 'EM_PAUSA';
                break;
            case 'DEVOLVER':
                updateData.status = 'ABERTO';
                updateData.assignedToId = null;
                break;
            default:
                if (body.status) updateData.status = body.status;
                if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
                if (body.priority) updateData.priority = body.priority;
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: updateData,
            include: { assignedTo: { select: { name: true } } }
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}