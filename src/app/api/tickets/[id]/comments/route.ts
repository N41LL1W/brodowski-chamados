import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Lista as mensagens do chat
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const comments = await (prisma as any).comment.findMany({
            where: { ticketId: id },
            include: { 
                user: { select: { name: true, role: true } } 
            },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(comments);
    } catch (error) {
        console.error("Erro ao buscar chat:", error);
        return NextResponse.json([], { status: 200 });
    }
}

// POST: Envia uma nova mensagem
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const { content } = await req.json();

    if (!session) return new NextResponse('Não autorizado', { status: 401 });

    try {
        const comment = await (prisma as any).comment.create({
            data: {
                content,
                ticketId: id,
                userId: (session.user as any).id
            }
        });
        return NextResponse.json(comment);
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        return NextResponse.json({ error: "Erro ao enviar" }, { status: 500 });
    }
}