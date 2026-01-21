import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse('Não autorizado', { status: 401 });
    }

    try {
        const { subject, description, priority, categoryId, departmentId } = await req.json();
        const userId = (session.user as any).id;

        // Gerar protocolo simples: DATA + TIMESTAMP
        const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

        const newTicket = await prisma.ticket.create({
            data: {
                protocol,
                subject, // Mudado de title para subject
                description,
                priority: priority || 'NORMAL',
                status: 'ABERTO',
                requesterId: userId, // Mudado de userId para requesterId
                categoryId: categoryId, // Agora obrigatório no novo schema
                departmentId: departmentId, // Agora obrigatório no novo schema
            }
        });

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar chamado:", error);
        return NextResponse.json({ message: "Erro ao abrir chamado", details: error.message }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse('Não autorizado', { status: 401 });
    }

    const user = session.user as any;
    const role = user.role;
    const userId = user.id;

    // Filtro: Funcionários vêem apenas os seus. 
    // No novo schema, usamos requesterId
    const whereClause: any = (role === 'FUNCIONARIO') ? { requesterId: userId } : {};

    const tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
            requester: { select: { name: true } }, // Mudado de user para requester
            category: { select: { name: true } },
            department: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
}