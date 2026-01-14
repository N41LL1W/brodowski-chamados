// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    // Agora incluímos 'ADMIN' na lista de permissões
    const allowedRoles = ['MASTER', 'CONTROLADOR', 'ADMIN'];
    const userRole = (session?.user as any)?.role;

    if (!session || !allowedRoles.includes(userRole)) {
        return new NextResponse('Não autorizado: Nível de acesso insuficiente.', { status: 403 });
    }

    try {
        const { name, email, password, role } = await req.json();
        
        // Validação básica
        if (!email || !password || !role) {
            return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                passwordHash: hashedPassword, 
                role 
            }
        });
        
        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar usuário:", error);
        return NextResponse.json({ message: "Erro ao criar usuário no banco" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    
    // Somente MASTER, ADMIN ou CONTROLADOR devem listar todos os usuários
    const allowedRoles = ['MASTER', 'CONTROLADOR', 'ADMIN'];
    const userRole = (session?.user as any)?.role;

    if (!session || !allowedRoles.includes(userRole)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    });
    return NextResponse.json(users);
}