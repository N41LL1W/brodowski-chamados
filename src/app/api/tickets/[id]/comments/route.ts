import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        console.error("Erro GET chat:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !(session.user as any).id) {
        return new NextResponse('Não autorizado', { status: 401 });
    }

    try {
        const { content } = await req.json();
        
        const comment = await (prisma as any).comment.create({
            data: {
                content,
                ticketId: id,
                userId: (session.user as any).id // Verifique se o campo no schema é userId
            },
            include: {
                user: { select: { name: true, role: true } }
            }
        });
        return NextResponse.json(comment);
    } catch (error: any) {
        console.error("Erro POST chat:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}