import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Usamos (prisma as any) para o TypeScript parar de reclamar que 'comment' não existe
        const comments = await (prisma as any).comment.findMany({
            where: { ticketId: id },
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar chat" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const { content } = await req.json();

    if (!session) return new NextResponse('Não autorizado', { status: 401 });

    try {
        // Usamos (prisma as any) aqui também
        const comment = await (prisma as any).comment.create({
            data: {
                content,
                ticketId: id,
                userId: (session.user as any).id
            },
            include: { user: { select: { name: true, role: true } } }
        });
        return NextResponse.json(comment);
    } catch (error) {
        console.error("Erro no chat:", error);
        return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
    }
}