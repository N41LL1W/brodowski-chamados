//src/app/api/tickets/route.ts

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

        // Busca a categoria — primeiro na CategoryConfig, depois na Category original
        let finalCategoryId = categoryId;
        try {
            const catConfig = await (prisma as any).categoryConfig.findUnique({ where: { id: categoryId } });
            if (catConfig) {
                // Garante que existe na tabela Category (cria se não existir)
                const existing = await prisma.category.findUnique({ where: { id: categoryId } });
                if (!existing) {
                    await prisma.category.create({
                        data: { id: categoryId, name: catConfig.name, icon: catConfig.icon }
                    });
                }
                finalCategoryId = categoryId;
            }
        } catch {
            // Usa o categoryId original se algo falhar
        }

        const newTicket = await prisma.ticket.create({
            data: {
                protocol,
                subject,
                description: description || '',
                location,
                priority: priority || 'NORMAL',
                status: 'ABERTO',
                requesterId: userId,
                categoryId: finalCategoryId,
                departmentId,
            }
        });

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        console.error('[TICKET_POST_ERROR]:', error);
        return NextResponse.json({ message: 'Erro ao abrir chamado', details: error.message }, { status: 500 });
    }
}