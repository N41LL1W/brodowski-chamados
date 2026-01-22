import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await props.params;
        const { content } = await req.json();

        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const userId = (session.user as any).id;

        // Tenta criar o comentário. Se der erro 500 aqui, o catch vai nos dizer porquê.
        const comment = await (prisma as any).comment.create({
            data: {
                content: content,
                ticketId: id,
                userId: userId, 
            },
            include: {
                user: { select: { name: true, role: true } }
            }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        console.error("DETALHE DO ERRO NO CLOUD:", error);
        // Retornamos o erro exato para você ver no console do navegador (aba Response)
        return NextResponse.json({ 
            message: "Erro no banco de dados", 
            error: error.message,
            code: error.code 
        }, { status: 500 });
    }
}