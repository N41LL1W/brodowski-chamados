import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticketId = Number(id);

  if (isNaN(ticketId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const formData = await req.formData();

  try {
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title: formData.get("title")?.toString(),
        description: formData.get("description")?.toString(),
        requester: formData.get("requester")?.toString(),
        status: formData.get("status")?.toString(),
        priority: formData.get("priority")?.toString(),
      },
    });

    // Apenas retorna JSON
    return NextResponse.json({ success: true, updated });

  } catch (error) {
    console.error("Erro no update:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ticket" },
      { status: 500 }
    );
  }
}
