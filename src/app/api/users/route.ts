import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    
    // Trava de segurança: só Master vê a lista de todos
    if (!session || (session.user as any)?.role !== 'MASTER') {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            include: {
                roleRelation: true,
                levelRelation: true
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 });
    }
}