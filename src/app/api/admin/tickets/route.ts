import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Verificação de Sessão
    if (!session || !session.user) {
      return new NextResponse('Você precisa estar logado para abrir um chamado.', { status: 401 });
    }

    // 2. Recebendo dados do corpo da requisição
    // Adicionei categoryId e departmentId que agora são necessários no seu schema
    const { subject, title, description, priority, categoryId, departmentId } = await req.json();

    // 3. Pegando o ID do usuário logado (Admin/Master)
    const requesterId = (session.user as any).id;

    // 4. Gerando um protocolo automático (Ex: 20260121-123)
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const generatedProtocol = `${datePart}-${randomPart}`;

    // 5. Criação no Banco de Dados
    const newTicket = await prisma.ticket.create({
      data: {
        protocol: generatedProtocol,
        subject: subject || title, // Aceita 'subject' ou 'title' para evitar quebra no front antigo
        description: description,
        priority: priority || "NORMAL",
        status: "ABERTO",
        requesterId: requesterId, // Corrigido de userId para requesterId
        
        // Se o seu front ainda não envia IDs de categoria/depto, 
        // precisaremos tratar ou garantir que existam no banco.
        // Aqui estou assumindo que eles vêm no JSON.
        categoryId: categoryId, 
        departmentId: departmentId,
      },
    });

    return NextResponse.json(newTicket);
  } catch (error: any) {
    console.error("Erro ao criar ticket (Admin):", error);
    return NextResponse.json(
      { message: "Erro ao criar chamado", details: error.message }, 
      { status: 500 }
    );
  }
}