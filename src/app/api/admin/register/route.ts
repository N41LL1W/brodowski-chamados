// src/app/api/admin/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    // 1. VERIFICAÇÃO DE AUTORIZAÇÃO (MASTER OU CONTROLADOR)
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Permite apenas se estiver logado e for CONTROLADOR ou MASTER
    if (!session || !['CONTROLADOR', 'MASTER'].includes(userRole)) {
        return new NextResponse('Acesso não autorizado. Apenas administradores podem usar esta API.', { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, email, password, role } = body; 

        if (!name || !email || !password || !role) {
            return new NextResponse('Dados incompletos.', { status: 400 });
        }

        // 2. Validar se a Role enviada é uma das permitidas (Adicionado MASTER aqui)
        const rolesPermitidas = ['FUNCIONARIO', 'TECNICO', 'CONTROLADOR', 'MASTER'];
        if (!rolesPermitidas.includes(role)) {
            return new NextResponse('Nível de acesso (role) inválido.', { status: 400 });
        }

        // 3. Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse('O e-mail informado já está em uso.', { status: 409 });
        }

        // 4. Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Criar o novo usuário
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role, 
            },
        });

        return NextResponse.json({ 
            message: "Usuário criado com sucesso.", 
            user: { id: newUser.id, name: newUser.name, role: newUser.role } 
        }, { status: 201 });

    } catch (error) {
        console.error('Erro na API de Registro Admin:', error);
        return new NextResponse('Erro interno do servidor.', { status: 500 });
    }
}