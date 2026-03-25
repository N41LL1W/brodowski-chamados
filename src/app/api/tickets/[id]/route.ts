import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Busca os detalhes de um chamado específico
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = params;

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
                    select: { 
                        id: true,
                        content: true,
                        proofImage: true, // GARANTE QUE A FOTO VEM DO BANCO
                        createdAt: true,
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

// POST: Cria um novo comentário ou nota técnica
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = params;
        const { content, isInternal, proofImage } = await req.json();

        if (!session?.user) {
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const user = session.user as any;

        // Validação: precisa de texto OU imagem
        if (!content?.trim() && !proofImage) {
            return NextResponse.json({ error: "O comentário não pode estar vazio" }, { status: 400 });
        }

        // Lógica de conteúdo: se for interno, prefixa. Se for só foto, avisa.
        const finalContent = isInternal 
            ? `[INTERNO] ${content || 'Anexo de imagem'}` 
            : (content || "Foto anexada ao chamado");

        const comment = await prisma.comment.create({
            data: { 
                content: finalContent, 
                proofImage: proofImage || null, // Salva o Base64 aqui
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
        return NextResponse.json({ error: "Falha ao salvar comentário" }, { status: 500 });
    }
}

// PATCH: Atualiza o status e workflow (Ações de assumir, finalizar, etc)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });
        
        const { id } = params;
        const { action, proofImage, ...body } = await req.json();
        const user = session.user as any;

        let updateData: any = { ...body };

        switch (action) {
            case 'ASSUMIR':
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
                // Salva a foto também no corpo do Ticket como prova final
                if (proofImage) updateData.proofImage = proofImage;
                break;
            case 'RETOMAR':
                updateData.status = 'IN_PROGRESS';
                break;
        }

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