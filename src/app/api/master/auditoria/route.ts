import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    });
    return NextResponse.json(logs);
}