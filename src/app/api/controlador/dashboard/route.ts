import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const role = (session.user as any).role;
    if (!['CONTROLADOR', 'MASTER'].includes(role)) {
        return new NextResponse('Acesso negado', { status: 403 });
    }

    const now = new Date();
    const hoje = new Date(now); hoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date(now); fimHoje.setHours(23, 59, 59, 999);
    const semanaPassada = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const duasSemanas   = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const mesPassado    = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
        totalPorStatus,
        ticketsHoje,
        ticketsSemana,
        ticketsSemanaAnterior,
        ticketsMes,
        ticketsPorCategoria,
        ticketsPorSecretaria,
        tecnicosComChamados,
        chamadosRecentes,
        chamadosUltimos14Dias,
        chamadosSemTecnico,
        slaConfigs,
        todosTicketsAbertos,
    ] = await Promise.all([
        prisma.ticket.groupBy({ by: ['status'], _count: { id: true } }),

        prisma.ticket.count({ where: { createdAt: { gte: hoje, lte: fimHoje } } }),

        prisma.ticket.count({ where: { createdAt: { gte: semanaPassada } } }),

        prisma.ticket.count({ where: { createdAt: { gte: duasSemanas, lt: semanaPassada } } }),

        prisma.ticket.count({ where: { createdAt: { gte: mesPassado } } }),

        prisma.ticket.groupBy({
            by: ['categoryId'], _count: { id: true },
            orderBy: { _count: { id: 'desc' } }, take: 8
        }),

        prisma.ticket.groupBy({
            by: ['departmentId', 'status'], _count: { id: true }
        }),

        prisma.user.findMany({
            where: { role: 'TECNICO' },
            select: {
                id: true, name: true,
                assignedTickets: {
                    select: {
                        id: true, status: true,
                        createdAt: true, updatedAt: true,
                        priority: true
                    }
                }
            }
        }),

        prisma.ticket.findMany({
            take: 100,
            orderBy: { updatedAt: 'desc' },
            include: {
                requester:  { select: { name: true } },
                assignedTo: { select: { name: true } },
                category:   { select: { name: true } },
                department: { select: { name: true } },
                comments:   {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: { user: { select: { name: true, role: true } } }
                }
            }
        }),

        prisma.ticket.findMany({
            where: { createdAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
            select: { createdAt: true, status: true }
        }),

        prisma.ticket.findMany({
            where: {
                assignedToId: null,
                status: { in: ['ABERTO', 'OPEN'] }
            },
            include: {
                requester:  { select: { name: true } },
                department: { select: { name: true } },
                category:   { select: { name: true } },
            },
            orderBy: { createdAt: 'asc' }
        }),

        prisma.sLAConfig.findMany(),

        prisma.ticket.findMany({
            where: { status: { in: ['ABERTO', 'OPEN', 'EM_ANDAMENTO', 'IN_PROGRESS'] } },
            select: { id: true, priority: true, createdAt: true, subject: true, protocol: true, status: true, assignedToId: true, department: { select: { name: true } }, assignedTo: { select: { name: true } } }
        }),
    ]);

    // Nomes de categorias
    const categoryIds = ticketsPorCategoria.map(c => c.categoryId);
    const departmentIds = [...new Set(ticketsPorSecretaria.map(d => d.departmentId))];

    const [categorias, secretarias] = await Promise.all([
        prisma.category.findMany({ where: { id: { in: categoryIds } } }),
        prisma.department.findMany({ where: { id: { in: departmentIds } } }),
    ]);

    // Série 14 dias
    const porDia: Record<string, { total: number; concluidos: number }> = {};
    chamadosUltimos14Dias.forEach(t => {
        const dia = new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (!porDia[dia]) porDia[dia] = { total: 0, concluidos: 0 };
        porDia[dia].total++;
        if (['CONCLUIDO', 'CONCLUDED'].includes(t.status)) porDia[dia].concluidos++;
    });

    const serie14Dias = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return { dia: label, total: porDia[label]?.total || 0, concluidos: porDia[label]?.concluidos || 0 };
    });

    // Status counts
    const getCount = (statuses: string[]) =>
        totalPorStatus.filter(s => statuses.includes(s.status)).reduce((acc, s) => acc + s._count.id, 0);

    const abertos     = getCount(['ABERTO', 'OPEN']);
    const emAndamento = getCount(['EM_ANDAMENTO', 'IN_PROGRESS']);
    const pausados    = getCount(['EM_PAUSA']);
    const concluidos  = getCount(['CONCLUIDO', 'CONCLUDED']);
    const total       = abertos + emAndamento + pausados + concluidos;

    // SLA — calcula status de cada ticket aberto
    const ticketsSlaStatus = todosTicketsAbertos.map(ticket => {
        const config = slaConfigs.find(s => s.priority.toUpperCase() === ticket.priority.toUpperCase());
        if (!config) return { ...ticket, slaStatus: 'sem_config', horasDecorridas: 0, percentual: 0 };
        const horas = (now.getTime() - new Date(ticket.createdAt).getTime()) / 3600000;
        const percentual = Math.min((horas / config.maxHours) * 100, 100);
        const horasRestantes = config.maxHours - horas;
        let slaStatus: string;
        if (horasRestantes < 0) slaStatus = 'atrasado';
        else if (percentual >= 75) slaStatus = 'alerta';
        else slaStatus = 'ok';
        return { ...ticket, slaStatus, horasDecorridas: Math.round(horas), horasRestantes: Math.round(horasRestantes), percentual: Math.round(percentual), maxHours: config.maxHours };
    });

    const atrasados = ticketsSlaStatus.filter(t => t.slaStatus === 'atrasado');
    const emAlerta  = ticketsSlaStatus.filter(t => t.slaStatus === 'alerta');

    // Secretarias com dados ricos
    const secretariasData = secretarias.map(s => {
        const rows = ticketsPorSecretaria.filter(t => t.departmentId === s.id);
        const totalSec    = rows.reduce((acc, r) => acc + r._count.id, 0);
        const concluidosSec = rows.filter(r => ['CONCLUIDO', 'CONCLUDED'].includes(r.status)).reduce((acc, r) => acc + r._count.id, 0);
        const abertosSec  = rows.filter(r => ['ABERTO', 'OPEN'].includes(r.status)).reduce((acc, r) => acc + r._count.id, 0);
        const atrasadosSec = atrasados.filter(t => t.department?.name === s.name).length;
        return { id: s.id, nome: s.name, total: totalSec, concluidos: concluidosSec, abertos: abertosSec, atrasados: atrasadosSec };
    }).sort((a, b) => b.total - a.total);

    // Técnicos com métricas
    const tecnicosData = tecnicosComChamados.map(t => {
        const todos      = t.assignedTickets;
        const concluidosTec = todos.filter(tk => ['CONCLUIDO', 'CONCLUDED'].includes(tk.status));
        const ativosTec  = todos.filter(tk => ['EM_ANDAMENTO', 'IN_PROGRESS'].includes(tk.status));
        const pausadosTec = todos.filter(tk => tk.status === 'EM_PAUSA');

        // Tempo médio de resolução (em horas)
        const tempoMedio = concluidosTec.length > 0
            ? concluidosTec.reduce((acc, tk) => {
                const horas = (new Date(tk.updatedAt).getTime() - new Date(tk.createdAt).getTime()) / 3600000;
                return acc + horas;
            }, 0) / concluidosTec.length
            : 0;

        const taxaResolucao = todos.length > 0 ? Math.round((concluidosTec.length / todos.length) * 100) : 0;

        return {
            id: t.id, name: t.name,
            total: todos.length,
            concluidos: concluidosTec.length,
            ativos: ativosTec.length,
            pausados: pausadosTec.length,
            tempoMedioHoras: Math.round(tempoMedio * 10) / 10,
            taxaResolucao,
        };
    }).sort((a, b) => b.concluidos - a.concluidos);

    // Timeline do dia
    const timelineHoje = chamadosRecentes
        .filter(t => new Date(t.updatedAt) >= hoje)
        .map(t => ({
            id: t.id,
            tipo: ['CONCLUIDO', 'CONCLUDED'].includes(t.status) ? 'CONCLUIDO' :
                  ['EM_ANDAMENTO', 'IN_PROGRESS'].includes(t.status) ? 'ATRIBUIDO' :
                  t.status === 'EM_PAUSA' ? 'PAUSADO' : 'ABERTO',
            protocol: t.protocol,
            subject: t.subject,
            tecnico: t.assignedTo?.name,
            solicitante: t.requester?.name,
            departamento: t.department?.name,
            hora: new Date(t.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }))
        .slice(0, 20);

    // Tendência semana
    const tendenciaSemana = ticketsSemanaAnterior > 0
        ? Math.round(((ticketsSemana - ticketsSemanaAnterior) / ticketsSemanaAnterior) * 100)
        : 0;

    return NextResponse.json({
        kpis: {
            total, abertos, emAndamento, pausados, concluidos,
            hoje: ticketsHoje, semana: ticketsSemana, mes: ticketsMes,
            tendenciaSemana,
            atrasados: atrasados.length,
            emAlerta: emAlerta.length,
            semTecnico: chamadosSemTecnico.length,
            taxaResolucaoGeral: total > 0 ? Math.round((concluidos / total) * 100) : 0,
        },
        serie14Dias,
        porCategoria: ticketsPorCategoria.map(c => ({
            nome: categorias.find(cat => cat.id === c.categoryId)?.name || c.categoryId,
            total: c._count.id
        })),
        secretarias: secretariasData,
        tecnicos: tecnicosData,
        chamadosRecentes,
        atrasados: atrasados.slice(0, 10),
        emAlerta:  emAlerta.slice(0, 10),
        semTecnico: chamadosSemTecnico,
        timelineHoje,
        slaResumo: {
            ok:       ticketsSlaStatus.filter(t => t.slaStatus === 'ok').length,
            alerta:   emAlerta.length,
            atrasado: atrasados.length,
            semConfig: ticketsSlaStatus.filter(t => t.slaStatus === 'sem_config').length,
        }
    });
}