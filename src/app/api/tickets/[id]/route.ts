import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await req.json();

  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        requester: body.requester,
        status: body.status,
        priority: body.priority,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
