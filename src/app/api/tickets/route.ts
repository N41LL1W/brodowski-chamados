import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    sendTicketOpenedEmail,
    sendNewTicketNotificationEmail
} from '@/lib/email';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

        const user = session.user as any;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const scope  = searchParams.get('scope'); // 'meus' ou 'todos'

        const where: any = {};

        // Se scope=meus OU se for FUNCIONARIO, filtra só os chamados do usuário
        if (scope === 'meus' || user.role === 'FUNCIONARIO') {
            where.requesterId = user.id;
        }

        if (status) where.status = status;

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                requester:  { select: { id: true, name: true } },
                category:   { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
                _count:     { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('[TICKETS_GET_ERROR]:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return new NextResponse('Não autorizado', { status: 401 });

    try {
        const { subject, description, priority, categoryId, departmentId, location } = await req.json();
        const userId = (session.user as any).id;
        const protocol = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Garante que a categoria existe na tabela Category
        let finalCategoryId = categoryId;
        try {
            const catConfig = await (prisma as any).categoryConfig.findUnique({ where: { id: categoryId } });
            if (catConfig) {
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

        // Envia e-mails — não bloqueia a resposta
        try {
            const fullTicket = await prisma.ticket.findUnique({
                where: { id: newTicket.id },
                include: {
                    requester:  { select: { name: true, email: true } },
                    department: { select: { name: true } },
                }
            });

            if (fullTicket?.requester?.email) {
                await sendTicketOpenedEmail(
                    fullTicket.requester.email,
                    fullTicket.requester.name || 'Usuário',
                    {
                        protocol: fullTicket.protocol,
                        subject:  fullTicket.subject,
                        priority: fullTicket.priority,
                        location: fullTicket.location || '',
                    }
                );
            }

            // Notifica técnicos
            const tecnicos = await prisma.user.findMany({
                where: { role: 'TECNICO', active: true },
                select: { email: true }
            });
            const emails = tecnicos.map(t => t.email).filter(Boolean) as string[];

            if (emails.length) {
                await sendNewTicketNotificationEmail(emails, {
                    protocol:   fullTicket!.protocol,
                    subject:    fullTicket!.subject,
                    priority:   fullTicket!.priority,
                    location:   fullTicket!.location || '',
                    department: fullTicket?.department?.name || '',
                });
            }
        } catch (emailError) {
            console.error('[EMAIL] Erro não crítico:', emailError);
        }

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        console.error('[TICKET_POST_ERROR]:', error);
        return NextResponse.json({ message: 'Erro ao abrir chamado', details: error.message }, { status: 500 });
    }
}