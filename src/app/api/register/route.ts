import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

// A URL EXATA QUE VOCÊ ME MANDOU (CORRIGIDA)
const dbUrl = "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

export async function POST(request: Request) {
  // Criamos o cliente DENTRO da função POST para garantir que ele pegue os dados novos
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
      },
    },
  });

  try {
    const body = await request.json();
    const { name, email, password } = body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('ERRO NO REGISTRO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // FECHA a conexão imediatamente para evitar o erro de credenciais presas
    await prisma.$disconnect();
  }
}