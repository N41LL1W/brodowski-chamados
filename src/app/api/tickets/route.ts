import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // 1. Pega a sessão para saber QUEM está abrindo o chamado
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Não autorizado. Faça login para abrir um chamado.', { status: 401 });
    }

    const { title, description, priority } = await req.json();

    // 2. Cria o ticket usando o ID do usuário da sessão
    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || "normal",
        status: "Aberto",
        // Aqui está a correção: usamos userId em vez de requester
        userId: (session.user as any).id, 
      },
    });

    return NextResponse.json(newTicket);
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o chamado" },
      { status: 500 }
    );
  }
}