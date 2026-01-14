import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

// URL ATUALIZADA COM .c-3 E CHANNEL_BINDING
const DATABASE_URL = "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // 1. Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já cadastrado.' }, { status: 409 });
    }

    // 2. Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Criar usuário como ADMIN
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "FUNCIONARIO",
      },
    });

    return NextResponse.json({ id: newUser.id, email: newUser.email }, { status: 201 });

  } catch (error: any) {
    console.error('ERRO NO REGISTRO:', error);
    return NextResponse.json({ 
      error: 'Erro de Autenticação no Banco',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}