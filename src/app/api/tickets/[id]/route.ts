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
                requester: { select: { id: true, name: true, email: true } },
                category: true,
                department: true,
                assignedTo: { select: { id: true, name: true } },
                comments: {
                    include: { user: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
        }

        // --- VALIDAÇÃO DE PRIVACIDADE REFEITA ---
        const isOwner = ticket.requesterId === userId;
        const isAssignedToMe = ticket.assignedToId === userId;
        const isManager = ["MASTER", "CONTROLADOR"].includes(userRole);

        // O Técnico só vê se ele for o dono OU se o chamado estiver atribuído a ele
        if (!isOwner && !isAssignedToMe && !isManager) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
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
        const userRole = (session.user as any).role;

        const ticket = await prisma.ticket.findUnique({ where: { id }, select: { requesterId: true, assignedToId: true } });
        
        const isOwner = ticket?.requesterId === userId;
        const isAssignedToMe = ticket?.assignedToId === userId;
        const isManager = ["MASTER", "CONTROLADOR"].includes(userRole);

        if (!isOwner && !isAssignedToMe && !isManager) {
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