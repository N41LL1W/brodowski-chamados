// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;
        const role = "FUNCIONARIO"; // Valor padrão para novos registros

        if (!name || !email || !password) {
            return new NextResponse('Dados de registro incompletos.', { status: 400 });
        }

        // 1. Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse('Usuário já registrado.', { status: 409 });
        }

        // 2. Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Criar o novo usuário no banco de dados
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash, 
                role,
            },
        });

        // 4. Retornar a resposta (sem o hash da senha)
        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        };

        return NextResponse.json(safeUser, { status: 201 });

    } catch (error) {
        console.error('Erro no registro do usuário:', error);
        return new NextResponse('Erro interno do servidor ao processar o registro.', { status: 500 });
    }
}