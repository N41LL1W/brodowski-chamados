import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const user = session.user as any;
    const isStaff = ['TECNICO', 'CONTROLADOR', 'MASTER', 'ADMIN'].includes(user.role);

    const visitas = await (prisma.ticket as any).findMany({
        where: {
            visitDate: { not: null },
            // Técnico vê só as dele, Master/Controlador vê todas
            ...(isStaff && user.role === 'TECNICO' 
                ? { OR: [{ assignedToId: user.id }, { assignedToId: null }] }
                : {}
            )
        },
        select: {
            id: true,
            protocol: true,
            subject: true,
            status: true,
            visitDate: true,
            visitNote: true,
            location: true,
            requester: { select: { name: true } },
            department: { select: { name: true } },
            assignedTo: { select: { name: true } }
        },
        orderBy: { visitDate: 'asc' }
    });

    return NextResponse.json(visitas);
}