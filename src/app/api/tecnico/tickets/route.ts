import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const userId = (session.user as any).id;

    // Busca apenas chamados onde o técnico atribuído é o usuário logado
    const tickets = await prisma.ticket.findMany({
      where: {
        assignedToId: userId
      },
      include: {
        requester: { select: { name: true, email: true } }, // CORREÇÃO: 'user' agora é 'requester'
        category: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Erro técnico list:", error);
    return NextResponse.json({ message: "Erro ao buscar chamados" }, { status: 500 });
  }
}