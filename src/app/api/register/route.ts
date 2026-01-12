// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client'; // Importamos o Cliente direto

// Criamos uma instância local para garantir que a URL da conexão seja lida
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;
        const role = "ADMIN"; // Alterei para ADMIN para você já entrar com poder total

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

    } catch (error: any) {
        console.error('Erro no registro do usuário:', error);
        // Retornamos o erro real para o log da Vercel ficar claro
        return new NextResponse(`Erro: ${error.message}`, { status: 500 });
    } finally {
        // Importante desconectar para não estourar o limite de conexões do Neon
        await prisma.$disconnect();
    }
}