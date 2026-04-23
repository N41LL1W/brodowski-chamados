import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const novos = await prisma.ticket.count({
        where: {
            status: { in: ['ABERTO', 'OPEN'] },
            assignedToId: null
        }
    });

    return NextResponse.json({ novos });
}