import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const slaConfigs = await prisma.sLAConfig.findMany();

    if (slaConfigs.length === 0) return NextResponse.json([]);

    const ticketsAbertos = await prisma.ticket.findMany({
        where: { status: { in: ['ABERTO', 'OPEN', 'EM_ANDAMENTO', 'IN_PROGRESS'] } },
        select: { id: true, priority: true, createdAt: true, subject: true, protocol: true }
    });

    const agora = new Date();

    const resultado = ticketsAbertos.map(ticket => {
        const config = slaConfigs.find(s =>
            s.priority.toUpperCase() === ticket.priority.toUpperCase()
        );
        if (!config) return { ...ticket, slaStatus: 'sem_config', horasRestantes: null };

        const horasDecorridas = (agora.getTime() - new Date(ticket.createdAt).getTime()) / 3600000;
        const horasRestantes = config.maxHours - horasDecorridas;
        const percentual = Math.min((horasDecorridas / config.maxHours) * 100, 100);

        let slaStatus: 'ok' | 'alerta' | 'atrasado';
        if (horasRestantes < 0) slaStatus = 'atrasado';
        else if (percentual >= 75) slaStatus = 'alerta';
        else slaStatus = 'ok';

        return {
            ...ticket,
            slaStatus,
            horasRestantes: Math.round(horasRestantes),
            percentual: Math.round(percentual),
            maxHours: config.maxHours,
            slaLabel: config.label,
            slaColor: config.color,
        };
    });

    return NextResponse.json(resultado);
}