import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

// IMPORTANTE: Definimos a URL aqui como uma constante de string pura
const dbUrl = "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Criamos o cliente garantindo que ele ignore qualquer variável de ambiente e use a string acima
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

export async function POST(request: Request) {
  try {
    // Para debug: Isso vai aparecer no seu log do Vercel
    console.log("Tentando conectar ao banco...");
    
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

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
    return NextResponse.json({ 
      error: 'Falha na autenticação do banco',
      details: error.message 
    }, { status: 500 });
  } finally {
    // Em Serverless, as vezes o prisma trava a conexão. Vamos fechar após o uso.
    await prisma.$disconnect();
  }
}