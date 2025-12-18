import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    
    // Proteção: Só MASTER ou CONTROLADOR vê a lista
    if (!session || !['MASTER', 'CONTROLADOR'].includes((session.user as any).role)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
        orderBy: { name: 'asc' }
    });

    return NextResponse.json(users);
}