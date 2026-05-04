import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
        totalUsers, activeUsers, totalTickets,
        ticketsByStatus, ticketsLast7, ticketsLast30,
        topTecnicos, recentAudit
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { active: true } }),
        prisma.ticket.count(),

        prisma.ticket.groupBy({ by: ['status'], _count: { id: true } }),

        prisma.ticket.count({ where: { createdAt: { gte: last7 } } }),
        prisma.ticket.count({ where: { createdAt: { gte: last30 } } }),

        prisma.user.findMany({
            where: { role: 'TECNICO' },
            select: {
                id: true, name: true,
                assignedTickets: { select: { id: true, status: true } }
            }
        }),

        prisma.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        })
    ]);

    const getCount = (statuses: string[]) =>
        ticketsByStatus.filter(s => statuses.includes(s.status))
            .reduce((acc, s) => acc + s._count.id, 0);

    return NextResponse.json({
        users: { total: totalUsers, active: activeUsers, inactive: totalUsers - activeUsers },
        tickets: {
            total: totalTickets,
            abertos: getCount(['ABERTO', 'OPEN']),
            emAndamento: getCount(['EM_ANDAMENTO', 'IN_PROGRESS']),
            concluidos: getCount(['CONCLUIDO', 'CONCLUDED']),
            pausados: getCount(['EM_PAUSA']),
            last7: ticketsLast7,
            last30: ticketsLast30,
        },
        tecnicos: topTecnicos.map(t => ({
            id: t.id, name: t.name,
            total: t.assignedTickets.length,
            concluidos: t.assignedTickets.filter(tk => ['CONCLUIDO', 'CONCLUDED'].includes(tk.status)).length,
            ativos: t.assignedTickets.filter(tk => ['EM_ANDAMENTO', 'IN_PROGRESS'].includes(tk.status)).length,
        })).sort((a, b) => b.concluidos - a.concluidos),
        recentAudit
    });
}