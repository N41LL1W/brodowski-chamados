import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

const DEFAULT_EVENTS = [
    { event: 'TICKET_OPENED',   label: 'Novo chamado aberto',         roles: ['TECNICO', 'CONTROLADOR'] },
    { event: 'TICKET_ASSIGNED', label: 'Chamado atribuído a técnico', roles: ['FUNCIONARIO'] },
    { event: 'TICKET_CLOSED',   label: 'Chamado concluído',           roles: ['FUNCIONARIO'] },
    { event: 'TICKET_PAUSED',   label: 'Chamado pausado',             roles: ['CONTROLADOR'] },
    { event: 'SLA_WARNING',     label: 'SLA em alerta (75%)',         roles: ['TECNICO', 'CONTROLADOR'] },
    { event: 'SLA_BREACH',      label: 'SLA violado',                 roles: ['TECNICO', 'CONTROLADOR', 'MASTER'] },
    { event: 'VISIT_SCHEDULED', label: 'Visita agendada',             roles: ['FUNCIONARIO'] },
    { event: 'NEW_COMMENT',     label: 'Nova mensagem no chamado',    roles: ['FUNCIONARIO', 'TECNICO'] },
];

export async function GET() {
    const saved = await (prisma as any).notificationConfig.findMany();
    const savedMap: Record<string, any> = {};
    saved.forEach((s: any) => { savedMap[s.event] = s; });

    const result = DEFAULT_EVENTS.map(e => ({
        ...e,
        enabled: savedMap[e.event]?.enabled ?? true,
        roles: savedMap[e.event]?.roles ? JSON.parse(savedMap[e.event].roles) : e.roles
    }));

    return NextResponse.json(result);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { event, enabled, roles, label } = await req.json();
    const result = await (prisma as any).notificationConfig.upsert({
        where: { event },
        update: { enabled, roles: JSON.stringify(roles), label },
        create: { event, label, enabled, roles: JSON.stringify(roles) }
    });
    return NextResponse.json(result);
}