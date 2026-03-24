import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Busca os detalhes de um chamado específico
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;

        if (!session?.user) {
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const user = session.user as any;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                requester: { select: { id: true, name: true, image: true } },
                category: true,
                department: true,
                assignedTo: { select: { id: true, name: true } },
                comments: {
                    include: { 
                        user: { select: { id: true, name: true, role: true, image: true } } 
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
        }

        const isOwner = ticket.requesterId === user.id;
        const isStaff = ['TECNICO', 'ADMIN', 'MASTER'].includes(user.role);

        if (!isOwner && !isStaff) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("[TICKET_GET_ERROR]:", error);
        return NextResponse.json({ error: "Erro interno ao buscar dados" }, { status: 500 });
    }
}

// POST: Cria um novo comentário ou nota técnica (COM SUPORTE A FOTO)
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        const { content, isInternal, proofImage } = await req.json();

        if (!session?.user) {
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const user = session.user as any;

        // Validamos se tem texto OU se tem imagem (pode enviar só a foto)
        if (!content?.trim() && !proofImage) {
            return NextResponse.json({ error: "O comentário não pode estar vazio" }, { status: 400 });
        }

        const finalContent = isInternal ? `[INTERNO] ${content || ''}` : content;

        const comment = await prisma.comment.create({
            data: { 
                content: finalContent || (proofImage ? "[FOTO ANEXADA]" : ""), 
                proofImage: proofImage || null, // Novo campo
                ticketId: id, 
                userId: user.id 
            },
            include: { 
                user: { select: { name: true, role: true } } 
            }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        console.error("[TICKET_POST_ERROR]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Atualiza o status e workflow
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = await props.params;
        const { action, proofImage, ...body } = await req.json();
        const user = session.user as any;

        let updateData: any = { ...body };

        switch (action) {
            case 'ASSUMIR':
            case 'RETOMAR':
                updateData.assignedToId = user.id;
                updateData.status = 'IN_PROGRESS';
                break;
            case 'PAUSAR':
                updateData.status = 'EM_PAUSA';
                break;
            case 'DEVOLVER':
                updateData.assignedToId = null;
                updateData.status = 'OPEN';
                break;
            case 'FINALIZAR':
                updateData.status = 'CONCLUDED';
                updateData.proofImage = proofImage;
                break;
        }

        updateData.updatedAt = new Date();

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        console.error("[TICKET_PATCH_ERROR]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}