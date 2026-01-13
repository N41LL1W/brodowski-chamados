// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

/** * Refatoração:
 * 1. Definimos a URL fora para garantir que não haja caracteres fantasmas.
 * 2. Usamos uma condicional para evitar abrir muitas conexões no banco Neon.
 */

const DATABASE_URL = "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require".trim();

// Mantém uma única instância se possível (Serverless Pattern)
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  });
} else {
  // Em desenvolvimento, evita o erro de "Too many connections" ao salvar arquivos
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: { db: { url: DATABASE_URL } },
    });
  }
  prisma = (global as any).prisma;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // 1. Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já registrado.' }, { status: 409 });
    }

    // 2. Criptografar a senha (usando bcryptjs que é mais estável na Vercel)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Criar o novo usuário (Role ADMIN por padrão para este primeiro acesso)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

    // 4. Resposta Segura
    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }, { status: 201 });

  } catch (error: any) {
    console.error('ERRO CRÍTICO NO REGISTRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno no servidor', 
      details: error.message 
    }, { status: 500 });
  }
  // Removido o disconnect forçado aqui para aproveitar a conexão em serverless, 
  // o Neon gerencia o tempo de inatividade.
}