import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse('Não autorizado', { status: 401 });
    }

    const user = session.user as any;

    // Filtro estrito: independente da role, busca apenas o que o usuário logado abriu
    const tickets = await prisma.ticket.findMany({
        where: {
            requesterId: user.id
        },
        include: {
            requester: { select: { name: true } },
            category: { select: { name: true } },
            department: { select: { name: true } },
            assignedTo: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return new NextResponse('Não autorizado', { status: 401 });

    try {
        const { subject, description, priority, categoryId, departmentId, location } = await req.json();
        const userId = (session.user as any).id;
        const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = await (prisma as any).ticket.create({
            data: {
                protocol,
                subject,
                description,
                location,
                priority: priority || 'NORMAL',
                status: 'ABERTO',
                requesterId: userId,
                categoryId: categoryId,
                departmentId: departmentId,
            }
        });
        return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao abrir chamado" }, { status: 500 });
    }
}