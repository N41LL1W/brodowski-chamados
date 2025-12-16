// src/app/api/admin/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
// Importamos o getServerSession para PROTEGER esta API
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Importa as opções de autenticação

export async function POST(request: Request) {
    // 1. VERIFICAÇÃO DE AUTORIZAÇÃO (CONTROLLER CHECK)
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'CONTROLADOR') {
        // Se não estiver logado ou não for controlador, nega acesso.
        return new NextResponse('Acesso não autorizado. Apenas Controladores podem usar esta API.', { status: 403 });
    }

    try {
        const body = await request.json();
        // Esta API aceita a ROLE!
        const { name, email, password, role } = body; 

        if (!name || !email || !password || !role) {
            return new NextResponse('Dados incompletos.', { status: 400 });
        }

        // 2. Verificar se a role é válida
        if (!['FUNCIONARIO', 'TECNICO', 'CONTROLADOR'].includes(role)) {
            return new NextResponse('Nível de acesso (role) inválido.', { status: 400 });
        }

        // 3. Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse('Usuário já registrado.', { status: 409 });
        }

        // 4. Criptografar a senha
        const passwordHash = await bcrypt.hash(password, 10);

        // 5. Criar o novo usuário
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role, // Usa o nível de acesso enviado pelo CONTROLADOR
            },
        });

        return NextResponse.json({ message: "Usuário criado com sucesso.", id: newUser.id }, { status: 201 });

    } catch (error) {
        console.error('Erro na API de Registro Admin:', error);
        return new NextResponse('Erro interno do servidor.', { status: 500 });
    }
}