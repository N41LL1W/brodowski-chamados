import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const role = (session.user as any).role;
    if (!['CONTROLADOR', 'MASTER'].includes(role)) {
        return new NextResponse('Acesso negado', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get('inicio');
    const dataFim = searchParams.get('fim');
    const status = searchParams.get('status');

    const where: any = {};
    if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt.gte = new Date(dataInicio);
        if (dataFim) where.createdAt.lte = new Date(dataFim + 'T23:59:59');
    }
    if (status && status !== 'TODOS') {
        const statusMap: Record<string, string[]> = {
            ABERTO:       ['ABERTO', 'OPEN'],
            EM_ANDAMENTO: ['EM_ANDAMENTO', 'IN_PROGRESS'],
            CONCLUIDO:    ['CONCLUIDO', 'CONCLUDED'],
            EM_PAUSA:     ['EM_PAUSA'],
        };
        where.status = { in: statusMap[status] || [status] };
    }

    const tickets = await prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            requester:  { select: { name: true } },
            assignedTo: { select: { name: true } },
            category:   { select: { name: true } },
            department: { select: { name: true } },
        }
    });

    return NextResponse.json(tickets);
}