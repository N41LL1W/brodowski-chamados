import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        // O Prisma gera os nomes baseados nos models do schema em minúsculo
        const roles = await prisma.role.findMany(); 
        const levels = await prisma.level.findMany({ orderBy: { rank: 'asc' } });
        
        return NextResponse.json({ roles, levels });
    } catch (error) {
        console.error("Erro ao buscar opções:", error);
        return NextResponse.json({ roles: [], levels: [] }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const { type, name, rank } = await req.json();

        if (type === 'role') {
            const newRole = await prisma.role.create({ data: { name } });
            return NextResponse.json(newRole);
        } 
        
        if (type === 'level') {
            const newLevel = await prisma.level.create({ 
                data: { name, rank: parseInt(rank) || 1 } 
            });
            return NextResponse.json(newLevel);
        }

        return new NextResponse('Invalid type', { status: 400 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao criar opção" }, { status: 500 });
    }
}