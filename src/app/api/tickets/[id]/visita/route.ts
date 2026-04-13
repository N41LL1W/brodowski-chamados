import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const { id } = await params;
    const { visitDate, visitNote } = await req.json();

    if (!visitDate) {
        return NextResponse.json({ message: 'Data obrigatória.' }, { status: 400 });
    }

    const user = session.user as any;

    await (prisma.ticket.update as any)({
        where: { id },
        data: {
            visitDate: new Date(visitDate),
            visitNote: visitNote || null,
        }
    });

    await prisma.comment.create({
        data: {
            content: `[VISITA] Visita agendada para ${new Date(visitDate).toLocaleString('pt-BR')}${visitNote ? ` — ${visitNote}` : ''}`,
            ticketId: id,
            userId: user.id,
        }
    });

    return NextResponse.json({ success: true });
}