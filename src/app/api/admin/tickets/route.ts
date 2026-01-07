import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    // 1. Verifica a sessão do usuário
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // 2. Proteção: Apenas MASTER e CONTROLADOR podem listar todos os chamados
    if (!session || !['MASTER', 'CONTROLADOR'].includes(userRole)) {
      return new NextResponse('Não autorizado', { status: 403 });
    }

    // 3. Busca todos os chamados incluindo os dados dos usuários relacionados
    const tickets = await prisma.ticket.findMany({
      include: {
        // Traz o nome de quem abriu o chamado
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // Traz o nome do técnico atribuído (se houver)
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      // Ordena pelos mais recentes primeiro
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Erro na API de Tickets:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar chamados" }, 
      { status: 500 }
    );
  }
}