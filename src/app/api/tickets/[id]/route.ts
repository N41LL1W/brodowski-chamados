import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET: Retorna os detalhes completos do chamado + Comentários
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
 * POST: Adiciona uma nova mensagem (comentário/nota técnica) ao chamado
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
 * PATCH: Atualiza o status, assume, pausa ou devolve o chamado
 */
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = await props.params;
        const body = await req.json();
        const user = session.user as any;

        // Lógica de Atualização Baseada em Ações
        const updateData: any = {};

        switch (body.action) {
            case 'ASSUMIR':
                updateData.status = 'EM_ANDAMENTO';
                updateData.assignedToId = user.id;
                break;

            case 'FINALIZAR':
                updateData.status = 'CONCLUIDO';
                // Salva o link da imagem se enviado no corpo da requisição
                if (body.proofImage) {
                    updateData.proofImage = body.proofImage;
                }
                break;

            case 'PAUSAR':
                updateData.status = 'EM_PAUSA';
                // Mantém o técnico atribuído, apenas muda o status
                break;

            case 'DEVOLVER':
                updateData.status = 'ABERTO';
                updateData.assignedToId = null; // Remove o técnico (torna o chamado disponível)
                break;

            default:
                // Fallback para atualizações genéricas (campos manuais)
                if (body.status) updateData.status = body.status;
                if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
                if (body.priority) updateData.priority = body.priority;
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