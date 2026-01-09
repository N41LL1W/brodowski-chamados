import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Bloqueia se não houver ninguém logado
    if (!session || !session.user) {
      return new NextResponse('Você precisa estar logado para abrir um chamado.', { status: 401 });
    }

    const { title, description, priority } = await req.json();

    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || "normal",
        status: "Aberto",
        // PEGA O ID AUTOMATICAMENTE DA SESSÃO
        userId: (session.user as any).id, 
      },
    });

    return NextResponse.json(newTicket);
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return NextResponse.json({ message: "Erro ao criar chamado" }, { status: 500 });
  }
}