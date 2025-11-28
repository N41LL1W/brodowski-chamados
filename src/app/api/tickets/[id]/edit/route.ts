import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = parseInt(params.id, 10);
    if (Number.isNaN(ticketId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    const { title, description, status, priority } = body;

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title,
        description,
        status,
        priority,
      },
    });

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar ticket:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ticket" },
      { status: 500 }
    );
  }
}
