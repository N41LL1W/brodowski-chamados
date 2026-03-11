import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const user = session.user as any;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                requester: { select: { id: true, name: true } },
                category: true,
                department: true,
                assignedTo: { select: { id: true, name: true } },
                comments: {
                    include: { user: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) return NextResponse.json({ message: "Não encontrado" }, { status: 404 });

        // SEGURANÇA: Dono do chamado OU Técnico/Admin podem ver
        const isOwner = ticket.requesterId === user.id;
        const isStaff = ['TECNICO', 'ADMIN', 'MASTER'].includes(user.role);

        if (!isOwner && !isStaff) {
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

        const comment = await prisma.comment.create({
            data: { content, ticketId: id, userId },
            include: { user: { select: { name: true, role: true } } }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ... Mantenha os GET e POST originais e substitua apenas o PATCH:

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = await props.params;
        const { action, proofImage, ...body } = await req.json();
        const user = session.user as any;

        let updateData: any = { ...body };

        // Lógica de Status Sincronizada com o Banco Neon
        if (action === 'ASSUMIR') {
            updateData.assignedToId = user.id;
            updateData.status = 'IN_PROGRESS';
        } else if (action === 'PAUSAR') {
            updateData.status = 'EM_PAUSA'; // Agora bate com seu NeonDB
        } else if (action === 'DEVOLVER') {
            updateData.assignedToId = null;
            updateData.status = 'OPEN';
        } else if (action === 'FINALIZAR') {
            updateData.status = 'CONCLUDED';
            updateData.proofImage = proofImage;
            updateData.updatedAt = new Date();
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}