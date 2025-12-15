// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma'; // Importa seu cliente Prisma

// Rota POST para lidar com o registro de novos usuários
export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Os campos 'name', 'email' e 'password' vêm do formulário de registro.
        // O campo 'role' será definido como 'FUNCIONARIO' por padrão.
        const { name, email, password } = body;

        // 1. Validação básica de campos
        if (!name || !email || !password) {
            return new NextResponse('Dados de registro incompletos. Nome, email e senha são obrigatórios.', { status: 400 });
        }

        // 2. Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse('Usuário já registrado. Por favor, faça login ou use outro email.', { status: 409 });
        }

        // 3. Criptografar a senha usando bcrypt
        // O saltRound 10 é um bom equilíbrio entre segurança e performance
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Criar o novo usuário no banco de dados
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash, // Salva a senha criptografada
                role: "FUNCIONARIO", // Define o nível de acesso padrão
            },
        });

        // 5. Retornar a resposta de sucesso
        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        };

        return NextResponse.json(safeUser, { status: 201 }); // 201 Created

    } catch (error) {
        console.error('Erro no registro do usuário:', error);
        return new NextResponse('Erro interno do servidor ao processar o registro.', { status: 500 });
    }
}