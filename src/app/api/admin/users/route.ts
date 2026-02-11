import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !['MASTER', 'CONTROLADOR'].includes((session.user as any).role)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true,
            // Adicione relações se existirem no seu prisma.schema
            // department: { select: { name: true } } 
        },
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(users);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !['MASTER', 'CONTROLADOR'].includes((session.user as any).role)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const { name, email, password, role, departmentId } = await req.json();

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 409 });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                passwordHash: hashedPassword, 
                role,
                // departmentId: departmentId || null // Descomente se tiver essa coluna
            }
        });
        
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 });
    }
}