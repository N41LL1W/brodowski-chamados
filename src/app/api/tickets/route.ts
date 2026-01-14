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
        const { title, description, priority } = await req.json();
        
        // Usamos (session.user as any) para acessar o id sem erro de TS
        const userId = (session.user as any).id;

        const newTicket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'normal',
                status: 'Aberto',
                userId: userId,
            }
        });

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar chamado:", error);
        return NextResponse.json({ message: "Erro ao abrir chamado" }, { status: 500 });
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

    // Funcionários vêem apenas os seus. 
    // ADMIN, MASTER e TECNICO vêem todos.
    const whereClause = (role === 'FUNCIONARIO') ? { userId: userId } : {};

    const tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
            user: { select: { name: true } },
            assignedTo: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
}