import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Força a API a ser dinâmica e não cachear falhas de conexão
export const dynamic = 'force-dynamic';

const DATABASE_URL = "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Singleton do Prisma para evitar estourar conexões no Neon
const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL }
  }
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // 1. Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já registrado.' }, { status: 409 });
    }

    // 2. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Criar o novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }, { status: 201 });

  } catch (error: any) {
    console.error('ERRO NO REGISTRO:', error);
    return NextResponse.json({ 
      error: 'Erro de conexão com o banco',
      message: error.message 
    }, { status: 500 });
  }
}