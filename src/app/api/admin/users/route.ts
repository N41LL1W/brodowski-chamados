import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Apenas Master ou Controlador podem ver a lista completa
    if (!session || !['MASTER', 'CONTROLADOR'].includes(userRole)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
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
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 });
    }
}