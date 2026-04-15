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

    const [
        totalPorStatus,
        totalPorCategoria,
        totalPorSecretaria,
        tecnicosComChamados,
        chamadosRecentes,
        chamadosUltimos30Dias,
    ] = await Promise.all([
        // Contagem por status
        prisma.ticket.groupBy({
            by: ['status'],
            _count: { id: true }
        }),

        // Contagem por categoria
        prisma.ticket.groupBy({
            by: ['categoryId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 6
        }),

        // Contagem por secretaria
        prisma.ticket.groupBy({
            by: ['departmentId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 6
        }),

        // Técnicos com contagem de chamados
        prisma.user.findMany({
            where: { role: 'TECNICO' },
            select: {
                id: true,
                name: true,
                assignedTickets: {
                    select: { id: true, status: true }
                }
            }
        }),

        // Chamados recentes com detalhes completos para o log
        prisma.ticket.findMany({
            take: 50,
            orderBy: { updatedAt: 'desc' },
            include: {
                requester: { select: { name: true } },
                assignedTo: { select: { name: true } },
                category: { select: { name: true } },
                department: { select: { name: true } },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true, role: true } }
                    }
                }
            }
        }),

        // Chamados dos últimos 30 dias agrupados por data
        prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            select: { createdAt: true, status: true }
        }),
    ]);

    // Busca nomes de categorias e secretarias
    const categoryIds = totalPorCategoria.map(c => c.categoryId);
    const departmentIds = totalPorSecretaria.map(d => d.departmentId);

    const [categorias, secretarias] = await Promise.all([
        prisma.category.findMany({ where: { id: { in: categoryIds } } }),
        prisma.department.findMany({ where: { id: { in: departmentIds } } }),
    ]);

    // Agrupa chamados por dia para o gráfico
    const porDia: Record<string, number> = {};
    chamadosUltimos30Dias.forEach(t => {
        const dia = new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        porDia[dia] = (porDia[dia] || 0) + 1;
    });

    // Monta série dos últimos 14 dias
    const serie14Dias = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return { dia: label, total: porDia[label] || 0 };
    });

    return NextResponse.json({
        totalPorStatus,
        porCategoria: totalPorCategoria.map(c => ({
            nome: categorias.find(cat => cat.id === c.categoryId)?.name || c.categoryId,
            total: c._count.id
        })),
        porSecretaria: totalPorSecretaria.map(d => ({
            nome: secretarias.find(s => s.id === d.departmentId)?.name || d.departmentId,
            total: d._count.id
        })),
        tecnicos: tecnicosComChamados.map(t => ({
            id: t.id,
            name: t.name,
            ativos: t.assignedTickets.filter(tk => ['IN_PROGRESS', 'EM_ANDAMENTO'].includes(tk.status)).length,
            concluidos: t.assignedTickets.filter(tk => ['CONCLUDED', 'CONCLUIDO'].includes(tk.status)).length,
            total: t.assignedTickets.length,
        })),
        chamadosRecentes,
        serie14Dias,
    });
}